// src/controller/poc.js
const Application = require('../Models/application.js');
const Department = require('../Models/department.js');
const Course = require('../Models/course.js');
const { sendMail } = require('../utils/email.js');
const AppError = require('../Error_class/error_class.js');

// Get all applications by department
exports.getApplicationsByDepartment = async (req, res, next) => {
  try {
    const { departmentId, courseId } = req.query;

    if (!departmentId) {
      throw new AppError('Department ID parameter is required', 400);
    }

    const filter = { departmentId, status: 'submitted' };
    if (courseId) {
      filter.courseId = courseId;
    }

    const applications = await Application.find(filter)
      .populate('departmentId')
      .populate('courseId')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// Get shortlisted applications by department
exports.getShortlistedByDepartment = async (req, res, next) => {
  try {
    const { departmentId, courseId } = req.query;

    if (!departmentId) {
      throw new AppError('Department ID parameter is required', 400);
    }

    const filter = { departmentId, status: 'shortlisted' };
    if (courseId) {
      filter.courseId = courseId;
    }

    const shortlisted = await Application.find(filter)
      .populate('departmentId')
      .populate('courseId')
      .sort({ shortlistedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: shortlisted.length,
      data: shortlisted
    });
  } catch (error) {
    next(error);
  }
};

// Get final list by department
exports.getFinalListByDepartment = async (req, res, next) => {
  try {
    const { departmentId, courseId } = req.query;

    if (!departmentId) {
      throw new AppError('Department ID parameter is required', 400);
    }

    const filter = { departmentId, status: 'finalized' };
    if (courseId) {
      filter.courseId = courseId;
    }

    const finalList = await Application.find(filter)
      .populate('departmentId')
      .populate('courseId')
      .sort({ finalizedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: finalList.length,
      data: finalList
    });
  } catch (error) {
    next(error);
  }
};

// Generate Shortlist Logic
exports.generateShortlist = async (req, res, next) => {
  try {
    const { departmentId, courseId, seats } = req.body;

    if (!departmentId || !courseId || !seats) {
      throw new AppError('Department ID, course ID, and seats are required', 400);
    }

    const totalSeats = parseInt(seats);

    // Verify department and course exist
    const department = await Department.findById(departmentId);
    const course = await Course.findById(courseId);

    if (!department || !course) {
      throw new AppError('Department or course not found', 404);
    }

    // 2. Fetch submitted applicants for this department and course
    const applicants = await Application.find({
      departmentId,
      courseId,
      status: 'submitted'
    }).lean();

    if (applicants.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No submitted applications found for this department and course.",
        count: 0
      });
    }

    // 3. Score extraction logic
    const scoreGetter = (app) => {
      return app.educationDetails?.entranceExam?.scores?.overall ||
        app.educationDetails?.entranceExam?.scores?.totalScore ||
        app.educationDetails?.entranceExam?.overallScore || 0;
    };

    // 4. Sort by Merit (Score Desc, then 12th % Desc)
    const getPercentage = (app) => app.educationDetails?.class12?.percentage || 0;

    applicants.sort((a, b) => {
      const scoreA = scoreGetter(a);
      const scoreB = scoreGetter(b);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return getPercentage(b) - getPercentage(a);
    });

    // 5. Calculate Quotas
    const quotas = {
      'OBC': Math.round(totalSeats * 0.27),
      'SC': Math.round(totalSeats * 0.15),
      'ST': Math.round(totalSeats * 0.075),
      'EWS': Math.round(totalSeats * 0.10)
    };

    const reservedSum = Object.values(quotas).reduce((a, b) => a + b, 0);
    const genSeats = totalSeats - reservedSum;

    // Helper: Checker for PwD status
    const isPwd = (a) => a.otherDetails?.physicalDisability === 'Yes' && a.documents?.disabilityCertificate;

    // Helper: Logic to apply Horizontal PwD Reservation with Swapping
    const finalizeListWithPwd = (currentList, pool, count, contextName) => {
      const pwdNeeded = Math.round(count * 0.05);
      if (pwdNeeded <= 0) return { final: currentList, leftover: pool };

      const currentPwdCount = currentList.filter(isPwd).length;
      if (currentPwdCount >= pwdNeeded) return { final: currentList, leftover: pool };

      const deficit = pwdNeeded - currentPwdCount;

      // Get available PwD candidates from the pool
      const availablePwD = pool.filter(isPwd);
      if (availablePwD.length === 0) return { final: currentList, leftover: pool };

      const final = [...currentList];
      let newPool = [...pool];
      let swaps = 0;

      for (let i = 0; i < availablePwD.length && swaps < deficit; i++) {
        const targetPwD = availablePwD[i];

        // Find lowest-ranking non-PwD in current selection to swap out
        for (let j = final.length - 1; j >= 0; j--) {
          if (!isPwd(final[j])) {
            const displaced = final[j];
            final[j] = targetPwD;

            // Update Pool: Remove PwD, Add Displaced
            newPool = newPool.filter(a => a._id.toString() !== targetPwD._id.toString());
            newPool.push(displaced);

            swaps++;
            console.log(`[AUDIT] ${contextName}: Swapped Non-PwD Candidate (${displaced._id}) with PwD Candidate (${targetPwD._id})`);
            break;
          }
        }
      }
      return { final, leftover: newPool };
    };

    // --- STEP A: Fill General (Open Merit) Seats First ---
    let initialGen = applicants.slice(0, genSeats);
    let remainingForGen = applicants.slice(genSeats);

    // Apply Horizontal PwD to General List
    const genResult = finalizeListWithPwd(initialGen, remainingForGen, genSeats, 'General_Open');
    const finalGen = genResult.final;
    let poolAfterGen = genResult.leftover;

    // Re-sort the pool to ensure merit order after possible swaps
    poolAfterGen.sort((a, b) => {
      const scoreA = scoreGetter(a);
      const scoreB = scoreGetter(b);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return getPercentage(b) - getPercentage(a);
    });

    // --- STEP B: Categorize Remaining Pool ---
    const buckets = { 'OBC': [], 'SC': [], 'ST': [], 'EWS': [] };

    poolAfterGen.forEach(app => {
      const cat = (app.studentDetails?.castCategory || '').toUpperCase();

      if (cat.includes('OBC')) buckets['OBC'].push(app);
      else if (cat.includes('SC') && !cat.includes('SCHOOL')) buckets['SC'].push(app);
      else if (cat.includes('ST') && !cat.includes('STUDENT')) buckets['ST'].push(app);
      else if (cat.includes('EWS') || cat.includes('ECONOMIC')) buckets['EWS'].push(app);
    });

    // --- STEP C: Fill Reserved Seats ---
    let finalShortlist = [...finalGen];

    for (const [key, count] of Object.entries(quotas)) {
      const catPool = buckets[key];

      let initialCatSelection = catPool.slice(0, count);
      let remainingCatPool = catPool.slice(count);

      // Apply Horizontal PwD to Category List
      const catResult = finalizeListWithPwd(initialCatSelection, remainingCatPool, count, `Category_${key}`);
      finalShortlist = [...finalShortlist, ...catResult.final];
    }

    // 7. Update status to 'shortlisted' for selected candidates
    const selectedIds = finalShortlist.map(app => app._id);
    await Application.updateMany(
      { _id: { $in: selectedIds } },
      {
        status: 'shortlisted',
        shortlistedAt: new Date()
      }
    );

    console.log(`✅ Updated ${selectedIds.length} candidates to 'shortlisted' status`);

    // 8. Send Email Notifications to Shortlisted Candidates
    console.log('📧 Sending email notifications to shortlisted candidates...');

    const emailPromises = finalShortlist.map(async (candidate, index) => {
      try {
        const email = candidate.studentDetails?.email;
        const fullName = candidate.studentDetails?.fullName;

        if (!email || !fullName) {
          console.warn(`⚠️ Skipping email for candidate at index ${index}: Missing email or name`);
          return { success: false, reason: 'Missing email or name', candidate: fullName || 'Unknown' };
        }

        // Determine selection category
        let selectionCategory = 'General (Open Merit)';
        let isPwdCandidate = isPwd(candidate);

        if (index >= finalGen.length) {
          // Candidate is from reserved category
          const castCategory = (candidate.studentDetails?.castCategory || '').toUpperCase();
          if (castCategory.includes('OBC')) selectionCategory = 'OBC (Other Backward Class)';
          else if (castCategory.includes('SC') && !castCategory.includes('SCHOOL')) selectionCategory = 'SC (Scheduled Caste)';
          else if (castCategory.includes('ST') && !castCategory.includes('STUDENT')) selectionCategory = 'ST (Scheduled Tribe)';
          else if (castCategory.includes('EWS') || castCategory.includes('ECONOMIC')) selectionCategory = 'EWS (Economically Weaker Section)';
        }

        // Get candidate's score
        const candidateScore = scoreGetter(candidate);

        // Email subject
        const subject = `🎉 Congratulations! Shortlisted for ${department.name} - ${course.name}`;

        // Email HTML content
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
              .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .info-row:last-child { border-bottom: none; }
              .label { font-weight: bold; color: #555; }
              .value { color: #333; }
              .badge { display: inline-block; padding: 5px 15px; background: #667eea; color: white; border-radius: 20px; font-size: 12px; }
              .pwd-badge { background: #10b981; }
              .footer { text-align: center; color: #777; margin-top: 30px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Congratulations!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">You've Been Shortlisted</p>
              </div>
              <div class="content">
                <p>Dear <strong>${fullName}</strong>,</p>
                <p>We are pleased to inform you that you have been <strong>selected</strong> for admission to <strong>${course.name}</strong> in the <strong>${department.name}</strong> department.</p>
                
                <div class="info-box">
                  <h3 style="margin-top: 0; color: #667eea;">📋 Selection Details</h3>
                  <div class="info-row">
                    <span class="label">Department:</span>
                    <span class="value"><strong>${department.name}</strong></span>
                  </div>
                  <div class="info-row">
                    <span class="label">Course:</span>
                    <span class="value"><strong>${course.name}</strong></span>
                  </div>
                  <div class="info-row">
                    <span class="label">Category:</span>
                    <span class="value"><span class="badge">${selectionCategory}</span></span>
                  </div>
                  ${isPwdCandidate ? `
                  <div class="info-row">
                    <span class="label">Special Quota:</span>
                    <span class="value"><span class="badge pwd-badge">PwD Reservation</span></span>
                  </div>
                  ` : ''}
                  <div class="info-row">
                    <span class="label">Entrance Exam Score:</span>
                    <span class="value"><strong>${candidateScore}</strong></span>
                  </div>
                  <div class="info-row">
                    <span class="label">Email:</span>
                    <span class="value">${email}</span>
                  </div>
                </div>

                <p style="color: #555; margin-top: 25px;">
                  <strong>📌 Note:</strong> This is a system-generated email confirming your selection. 
                  Please keep this email for your records.
                </p>

                <p style="margin-top: 30px;">Best Regards,<br><strong>Admissions Committee</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated notification. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const emailResult = await sendMail(email, subject, htmlContent);

        if (emailResult.success) {
          console.log(`✅ Email sent successfully to ${fullName} (${email})`);
          return { success: true, email, name: fullName };
        } else {
          console.error(`❌ Failed to send email to ${fullName} (${email}): ${emailResult.error}`);
          return { success: false, email, name: fullName, error: emailResult.error };
        }
      } catch (error) {
        console.error(`❌ Error sending email to candidate at index ${index}:`, error.message);
        return { success: false, error: error.message };
      }
    });

    // Wait for all emails to complete (success or failure)
    const emailResults = await Promise.allSettled(emailPromises);

    const emailStats = emailResults.reduce((acc, result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        acc.sent++;
      } else {
        acc.failed++;
      }
      return acc;
    }, { sent: 0, failed: 0 });

    console.log(`📧 Email Summary: ${emailStats.sent} sent, ${emailStats.failed} failed`);

    res.status(200).json({
      success: true,
      message: "Shortlist generated successfully",
      department: department.name,
      course: course.name,
      totalSeats,
      shortlisted: finalShortlist.length,
      breakdown: {
        GEN_Selected: finalGen.length,
        Reserved_Pool_OBC: buckets['OBC'].length,
        Reserved_Pool_SC: buckets['SC'].length,
        Reserved_Pool_ST: buckets['ST'].length,
        Reserved_Pool_EWS: buckets['EWS'].length
      },
      emailNotifications: {
        sent: emailStats.sent,
        failed: emailStats.failed,
        total: finalShortlist.length
      }
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Regenerate Shortlist (Second/Subsequent Round)
exports.regenerateShortlist = async (req, res, next) => {
  try {
    const { departmentId, courseId } = req.body;

    if (!departmentId || !courseId) {
      throw new AppError('Department ID and course ID are required', 400);
    }

    // 1. Verify department and course exist
    const department = await Department.findById(departmentId);
    const course = await Course.findById(courseId);

    if (!department || !course) {
      throw new AppError('Department or course not found', 404);
    }

    const totalSeats = course.totalSeats;

    // 2. Calculate Total Quotas (based on total seats)
    const quotas = {
      'OBC': Math.round(totalSeats * 0.27),
      'SC': Math.round(totalSeats * 0.15),
      'ST': Math.round(totalSeats * 0.075),
      'EWS': Math.round(totalSeats * 0.10)
    };

    const reservedSum = Object.values(quotas).reduce((a, b) => a + b, 0);
    const genQuota = totalSeats - reservedSum;

    console.log(`📊 Total Seats: ${totalSeats}`);
    console.log(`📊 Category Quotas - GEN: ${genQuota}, OBC: ${quotas['OBC']}, SC: ${quotas['SC']}, ST: ${quotas['ST']}, EWS: ${quotas['EWS']}`);

    // 3. Cleanup: Reject students who were shortlisted but didn't pay
    const rejectedResult = await Application.updateMany(
      {
        departmentId,
        courseId,
        status: 'shortlisted',
        fees: { $ne: 'paid' }
      },
      {
        status: 'rejected',
        rejectedAt: new Date()
      }
    );

    console.log(`🚫 Rejected ${rejectedResult.modifiedCount} non-paying shortlisted students`);

    // 4. Count Finalized Students by Category
    const finalizedApps = await Application.find({
      departmentId,
      courseId,
      status: 'finalized'
    }).lean();

    const finalizedCount = {
      'GEN': 0,
      'OBC': 0,
      'SC': 0,
      'ST': 0,
      'EWS': 0
    };

    finalizedApps.forEach(app => {
      const cat = (app.studentDetails?.castCategory || '').toUpperCase();

      if (cat.includes('OBC')) {
        finalizedCount['OBC']++;
      } else if (cat.includes('SC') && !cat.includes('SCHOOL')) {
        finalizedCount['SC']++;
      } else if (cat.includes('ST') && !cat.includes('STUDENT')) {
        finalizedCount['ST']++;
      } else if (cat.includes('EWS') || cat.includes('ECONOMIC')) {
        finalizedCount['EWS']++;
      } else {
        finalizedCount['GEN']++;
      }
    });

    console.log(`✅ Finalized Count - GEN: ${finalizedCount['GEN']}, OBC: ${finalizedCount['OBC']}, SC: ${finalizedCount['SC']}, ST: ${finalizedCount['ST']}, EWS: ${finalizedCount['EWS']}`);

    // 5. Calculate Empty Seats
    const emptySeats = {
      'GEN': Math.max(0, genQuota - finalizedCount['GEN']),
      'OBC': Math.max(0, quotas['OBC'] - finalizedCount['OBC']),
      'SC': Math.max(0, quotas['SC'] - finalizedCount['SC']),
      'ST': Math.max(0, quotas['ST'] - finalizedCount['ST']),
      'EWS': Math.max(0, quotas['EWS'] - finalizedCount['EWS'])
    };

    const totalEmptySeats = Object.values(emptySeats).reduce((a, b) => a + b, 0);

    console.log(`🔄 Empty Seats - GEN: ${emptySeats['GEN']}, OBC: ${emptySeats['OBC']}, SC: ${emptySeats['SC']}, ST: ${emptySeats['ST']}, EWS: ${emptySeats['EWS']}`);
    console.log(`📍 Total Empty Seats: ${totalEmptySeats}`);

    if (totalEmptySeats === 0) {
      return res.status(200).json({
        success: true,
        message: "No empty seats available. All quotas are filled.",
        totalSeats,
        emptySeats
      });
    }

    // 6. Fetch Candidate Pool (only submitted students)
    const applicants = await Application.find({
      departmentId,
      courseId,
      status: 'submitted'
    }).lean();

    if (applicants.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No submitted applications found for regeneration.",
        count: 0,
        emptySeats
      });
    }

    // 7. Helper functions (same as original)
    const scoreGetter = (app) => {
      return app.educationDetails?.entranceExam?.scores?.overall ||
        app.educationDetails?.entranceExam?.scores?.totalScore ||
        app.educationDetails?.entranceExam?.overallScore || 0;
    };

    const getPercentage = (app) => app.educationDetails?.class12?.percentage || 0;

    const isPwd = (a) => a.otherDetails?.physicalDisability === 'Yes' && a.documents?.disabilityCertificate;

    const finalizeListWithPwd = (currentList, pool, count, contextName) => {
      const pwdNeeded = Math.round(count * 0.05);
      if (pwdNeeded <= 0) return { final: currentList, leftover: pool };

      const currentPwdCount = currentList.filter(isPwd).length;
      if (currentPwdCount >= pwdNeeded) return { final: currentList, leftover: pool };

      const deficit = pwdNeeded - currentPwdCount;
      const availablePwD = pool.filter(isPwd);
      if (availablePwD.length === 0) return { final: currentList, leftover: pool };

      const final = [...currentList];
      let newPool = [...pool];
      let swaps = 0;

      for (let i = 0; i < availablePwD.length && swaps < deficit; i++) {
        const targetPwD = availablePwD[i];

        for (let j = final.length - 1; j >= 0; j--) {
          if (!isPwd(final[j])) {
            const displaced = final[j];
            final[j] = targetPwD;

            newPool = newPool.filter(a => a._id.toString() !== targetPwD._id.toString());
            newPool.push(displaced);

            swaps++;
            console.log(`[AUDIT] ${contextName}: Swapped Non-PwD Candidate (${displaced._id}) with PwD Candidate (${targetPwD._id})`);
            break;
          }
        }
      }
      return { final, leftover: newPool };
    };

    // 8. Sort applicants by merit
    applicants.sort((a, b) => {
      const scoreA = scoreGetter(a);
      const scoreB = scoreGetter(b);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return getPercentage(b) - getPercentage(a);
    });

    // 9. Fill GEN Empty Seats
    let finalShortlist = [];
    let pool = [...applicants];

    if (emptySeats['GEN'] > 0) {
      let initialGen = pool.slice(0, emptySeats['GEN']);
      let remainingForGen = pool.slice(emptySeats['GEN']);

      const genResult = finalizeListWithPwd(initialGen, remainingForGen, emptySeats['GEN'], 'Regenerate_GEN');
      finalShortlist = [...genResult.final];
      pool = genResult.leftover;

      // Re-sort pool
      pool.sort((a, b) => {
        const scoreA = scoreGetter(a);
        const scoreB = scoreGetter(b);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return getPercentage(b) - getPercentage(a);
      });

      console.log(`✅ Filled ${emptySeats['GEN']} GEN empty seats`);
    }

    // 10. Categorize Remaining Pool
    const buckets = { 'OBC': [], 'SC': [], 'ST': [], 'EWS': [] };

    pool.forEach(app => {
      const cat = (app.studentDetails?.castCategory || '').toUpperCase();

      if (cat.includes('OBC')) buckets['OBC'].push(app);
      else if (cat.includes('SC') && !cat.includes('SCHOOL')) buckets['SC'].push(app);
      else if (cat.includes('ST') && !cat.includes('STUDENT')) buckets['ST'].push(app);
      else if (cat.includes('EWS') || cat.includes('ECONOMIC')) buckets['EWS'].push(app);
    });

    // 11. Fill Reserved Category Empty Seats
    for (const [key, emptyCount] of Object.entries(emptySeats)) {
      if (key === 'GEN' || emptyCount === 0) continue;

      const catPool = buckets[key];

      if (catPool.length === 0) {
        console.log(`⚠️ No candidates available for ${key} category`);
        continue;
      }

      let initialCatSelection = catPool.slice(0, emptyCount);
      let remainingCatPool = catPool.slice(emptyCount);

      const catResult = finalizeListWithPwd(initialCatSelection, remainingCatPool, emptyCount, `Regenerate_${key}`);
      finalShortlist = [...finalShortlist, ...catResult.final];

      console.log(`✅ Filled ${catResult.final.length} ${key} empty seats`);
    }

    // 12. Update status to 'shortlisted' for selected candidates
    const selectedIds = finalShortlist.map(app => app._id);
    await Application.updateMany(
      { _id: { $in: selectedIds } },
      {
        status: 'shortlisted',
        shortlistedAt: new Date()
      }
    );

    console.log(`✅ Updated ${selectedIds.length} candidates to 'shortlisted' status (Regeneration)`);

    // 13. Send Email Notifications
    console.log('📧 Sending email notifications to newly shortlisted candidates...');

    const emailPromises = finalShortlist.map(async (candidate, index) => {
      try {
        const email = candidate.studentDetails?.email;
        const fullName = candidate.studentDetails?.fullName;

        if (!email || !fullName) {
          console.warn(`⚠️ Skipping email for candidate: Missing email or name`);
          return { success: false, reason: 'Missing email or name' };
        }

        let selectionCategory = 'General (Open Merit)';
        let isPwdCandidate = isPwd(candidate);

        const castCategory = (candidate.studentDetails?.castCategory || '').toUpperCase();
        if (castCategory.includes('OBC')) selectionCategory = 'OBC (Other Backward Class)';
        else if (castCategory.includes('SC') && !castCategory.includes('SCHOOL')) selectionCategory = 'SC (Scheduled Caste)';
        else if (castCategory.includes('ST') && !castCategory.includes('STUDENT')) selectionCategory = 'ST (Scheduled Tribe)';
        else if (castCategory.includes('EWS') || castCategory.includes('ECONOMIC')) selectionCategory = 'EWS (Economically Weaker Section)';

        const candidateScore = scoreGetter(candidate);
        const subject = `🎉 Congratulations! Shortlisted for ${department.name} - ${course.name}`;

        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
              .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .info-row:last-child { border-bottom: none; }
              .label { font-weight: bold; color: #555; }
              .value { color: #333; }
              .badge { display: inline-block; padding: 5px 15px; background: #667eea; color: white; border-radius: 20px; font-size: 12px; }
              .pwd-badge { background: #10b981; }
              .regenerate-badge { background: #f59e0b; }
              .footer { text-align: center; color: #777; margin-top: 30px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Congratulations!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">You've Been Shortlisted</p>
              </div>
              <div class="content">
                <p>Dear <strong>${fullName}</strong>,</p>
                <p>We are pleased to inform you that you have been <strong>selected</strong> for admission to <strong>${course.name}</strong> in the <strong>${department.name}</strong> department.</p>
                
                <div class="info-box">
                  <h3 style="margin-top: 0; color: #667eea;">📋 Selection Details</h3>
                  <div class="info-row">
                    <span class="label">Department:</span>
                    <span class="value"><strong>${department.name}</strong></span>
                  </div>
                  <div class="info-row">
                    <span class="label">Course:</span>
                    <span class="value"><strong>${course.name}</strong></span>
                  </div>
                  <div class="info-row">
                    <span class="label">Category:</span>
                    <span class="value"><span class="badge">${selectionCategory}</span></span>
                  </div>
                  ${isPwdCandidate ? `
                  <div class="info-row">
                    <span class="label">Special Quota:</span>
                    <span class="value"><span class="badge pwd-badge">PwD Reservation</span></span>
                  </div>
                  ` : ''}
                  <div class="info-row">
                    <span class="label">Entrance Exam Score:</span>
                    <span class="value"><strong>${candidateScore}</strong></span>
                  </div>
                  <div class="info-row">
                    <span class="label">Email:</span>
                    <span class="value">${email}</span>
                  </div>
                </div>

                <p style="color: #555; margin-top: 25px;">
                  <strong>📌 Note:</strong> This is a system-generated email confirming your selection. 
                  Please keep this email for your records.
                </p>

                <p style="margin-top: 30px;">Best Regards,<br><strong>Admissions Committee</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated notification. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const emailResult = await sendMail(email, subject, htmlContent);

        if (emailResult.success) {
          console.log(`✅ Email sent successfully to ${fullName} (${email})`);
          return { success: true, email, name: fullName };
        } else {
          console.error(`❌ Failed to send email to ${fullName} (${email}): ${emailResult.error}`);
          return { success: false, email, name: fullName, error: emailResult.error };
        }
      } catch (error) {
        console.error(`❌ Error sending email:`, error.message);
        return { success: false, error: error.message };
      }
    });

    const emailResults = await Promise.allSettled(emailPromises);

    const emailStats = emailResults.reduce((acc, result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        acc.sent++;
      } else {
        acc.failed++;
      }
      return acc;
    }, { sent: 0, failed: 0 });

    console.log(`📧 Email Summary: ${emailStats.sent} sent, ${emailStats.failed} failed`);

    res.status(200).json({
      success: true,
      message: "Second round shortlist generated successfully",
      department: department.name,
      course: course.name,
      totalSeats,
      emptySeats,
      newlyShortlisted: finalShortlist.length,
      rejectedNonPayers: rejectedResult.modifiedCount,
      breakdown: {
        GEN_finalized: finalizedCount['GEN'],
        OBC_finalized: finalizedCount['OBC'],
        SC_finalized: finalizedCount['SC'],
        ST_finalized: finalizedCount['ST'],
        EWS_finalized: finalizedCount['EWS']
      },
      emailNotifications: {
        sent: emailStats.sent,
        failed: emailStats.failed,
        total: finalShortlist.length
      }
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
};