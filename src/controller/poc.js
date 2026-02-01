// src/controller/poc.js
const RCET_applicants = require('../Models/rcet candidates.js');
const BBA_LLB_applicants = require('../Models/BBA LLB applicants.js');
const Btech_applicants = require('../Models/Btech applicants.js');
const SuperAdmin = require('../Models/super_admin.js');
const User = require('../Models/user.js');
const TempUser = require('../Models/temp users.js');
const POC = require('../Models/poc.js');
const { sendMail } = require('../utils/email.js');

// Import models from subdirectories with correct file paths and model names
const SASET = {
  finalList: require('../Models/saset/saset_final_list'),
  shortList: require('../Models/saset/saset_short_list')
};

const SBSFI = {
  finalList: require('../Models/sbsfi/sbsfi_final_list'),
  shortList: require('../Models/sbsfi/sbsfi_short_list')
};

const SCLML = {
  finalList: require('../Models/sclml/sclml_final_list'),
  shortList: require('../Models/sclml/sclml_short_list')
};

const SICMSS = {
  finalList: require('../Models/sicmss/sicmss_final_list'),
  shortList: require('../Models/sicmss/sicmss_short_list')
};

const SICSSL = {
  finalList: require('../Models/sicssl/sicssl_final_list'),
  shortList: require('../Models/sicssl/sicssl_short_list')
};

const SISDSS = {
  finalList: require('../Models/sisdss/sisdss_final_list'),
  shortList: require('../Models/sisdss/sisdss_short_list')
};

const SISSP = {
  finalList: require('../Models/sissp/sissp_final_list'),
  shortList: require('../Models/sissp/sissp_shortlist')
};

const SITAICS = {
  finalList: require('../Models/sitaics/sitaics_final_list'),
  shortList: require('../Models/sitaics/sitaics_short_list')
};

const SPES = {
  finalList: require('../Models/spes/spes_final_list'),
  shortList: require('../Models/spes/spes_short_list')
};

const SPICSM = {
  finalList: require('../Models/spicsm/spicsm_final_list'),
  shortList: require('../Models/spicsm/spicsm_short_list')
};

// Get all applications by department
exports.getApplicationsByDepartment = async (req, res) => {
  try {
    const { department } = req.query;

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department parameter is required"
      });
    }

    let applications = [];

    // Search based on department type
    if (department.toLowerCase() === 'btech') {
      applications = await Btech_applicants.find({}).sort({ createdAt: -1 }).lean();
    } else if (department.toLowerCase() === 'llb') {
      applications = await BBA_LLB_applicants.find({}).sort({ createdAt: -1 }).lean();
    } else {
      // For other departments, search in RCET_applicants with department filter
      applications = await RCET_applicants.find({ department }).sort({ createdAt: -1 }).lean();
    }

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};



// Get shortlisted applications by department
exports.getShortlistedByDepartment = async (req, res) => {
  try {
    const { department } = req.query;

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department parameter is required"
      });
    }

    let shortlisted = [];
    const deptLower = department.toLowerCase();

    // Map of department names to their corresponding shortList models
    const departmentModels = {
      'saset': SASET.shortList,
      'sbsfi': SBSFI.shortList,
      'sclml': SCLML.shortList,
      'sicmss': SICMSS.shortList,
      'sicssl': SICSSL.shortList,
      'sisdss': SISDSS.shortList,
      'sissp': SISSP.shortList,
      'sitaics': SITAICS.shortList,
      'spes': SPES.shortList,
      'spicsm': SPICSM.shortList
    };

    // Get the model for the specified department
    const model = departmentModels[deptLower];
    if (!model) {
      return res.status(404).json({
        success: false,
        message: `No shortlist found for department: ${department}`
      });
    }

    // Find all documents in the department's shortlist
    shortlisted = await model.find({}).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      count: shortlisted.length,
      data: shortlisted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get final list by department
exports.getFinalListByDepartment = async (req, res) => {
  try {
    const { department } = req.query;

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department parameter is required"
      });
    }

    let finalList = [];
    const deptLower = department.toLowerCase();

    // Map of department names to their corresponding finalList models
    const departmentModels = {
      'saset': SASET.finalList,
      'sbsfi': SBSFI.finalList,
      'sclml': SCLML.finalList,
      'sicmss': SICMSS.finalList,
      'sicssl': SICSSL.finalList,
      'sisdss': SISDSS.finalList,
      'sissp': SISSP.finalList,
      'sitaics': SITAICS.finalList,
      'spes': SPES.finalList,
      'spicsm': SPICSM.finalList
    };

    // Get the model for the specified department
    const model = departmentModels[deptLower];
    if (!model) {
      return res.status(404).json({
        success: false,
        message: `No final list found for department: ${department}`
      });
    }

    // Find all documents in the department's final list
    finalList = await model.find({}).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      count: finalList.length,
      data: finalList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Generate Shortlist Logic
exports.generateShortlist = async (req, res) => {
  try {
    const { department, seats } = req.body;

    if (!department || !seats) {
      return res.status(400).json({ success: false, message: "Department and seats are required" });
    }

    const deptLower = department.toLowerCase();
    const totalSeats = parseInt(seats);

    // 1. Identify Source & Filtering
    let SourceModel;
    let query = { status: 'Submitted' }; // Only submitted applications
    let scoreGetter = (app) => 0; // Default scorer

    if (deptLower === 'sitaics') {
      SourceModel = Btech_applicants;
      query.department = 'sitaics';
      scoreGetter = (app) => app.educationDetails?.entranceExam?.scores?.overall || 0;
    } else if (deptLower === 'saset') {
      SourceModel = Btech_applicants; // As per updated instruction
      query.department = 'saset';
      scoreGetter = (app) => app.educationDetails?.entranceExam?.scores?.overall || 0;
    } else if (deptLower === 'sclml') {
      SourceModel = BBA_LLB_applicants;
      // No department filter for LLB
      scoreGetter = (app) => app.educationDetails?.entranceExam?.scores?.totalScore || 0;
    } else {
      SourceModel = RCET_applicants;
      query.department = department;
      scoreGetter = (app) => app.educationDetails?.entranceExam?.overallScore || 0;
    }

    // 2. Fetch Applicants
    const applicants = await SourceModel.find(query).lean();

    if (applicants.length === 0) {
      return res.status(200).json({ success: true, message: "No submitted applications found for this department.", count: 0 });
    }

    // 3. Sort by Merit (Score Desc, then 12th % Desc)
    const getPercentage = (app) => app.educationDetails?.class12?.percentage || 0;

    applicants.sort((a, b) => {
      const scoreA = scoreGetter(a);
      const scoreB = scoreGetter(b);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return getPercentage(b) - getPercentage(a);
    });

    // 4. Destination Model (Shortlist)
    const departmentModels = {
      'saset': SASET.shortList,
      'sbsfi': SBSFI.shortList,
      'sclml': SCLML.shortList,
      'sicmss': SICMSS.shortList,
      'sicssl': SICSSL.shortList,
      'sisdss': SISDSS.shortList,
      'sissp': SISSP.shortList,
      'sitaics': SITAICS.shortList,
      'spes': SPES.shortList,
      'spicsm': SPICSM.shortList
    };

    const ShortlistModel = departmentModels[deptLower];
    if (!ShortlistModel) {
      return res.status(404).json({ success: false, message: `Invalid Department Code: ${department}` });
    }

    // 5. Calculate Quotas
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

    // 7. Overwrite & Save with Data Mapping
    await ShortlistModel.deleteMany({});

    const docsToInsert = finalShortlist.map(app => {
      let doc = { ...app };
      delete doc._id;
      delete doc.createdAt;
      delete doc.updatedAt;

      // Handle 'totalScore' or 'overallScore' -> 'scores.overall' mapping
      if (!doc.educationDetails) doc.educationDetails = {};
      if (!doc.educationDetails.entranceExam) doc.educationDetails.entranceExam = {};

      let score = 0;
      if (deptLower === 'sclml') score = app.educationDetails?.entranceExam?.scores?.totalScore;
      else if (deptLower === 'sitaics' || deptLower === 'saset') score = app.educationDetails?.entranceExam?.scores?.overall;
      else score = app.educationDetails?.entranceExam?.overallScore;

      if (!doc.educationDetails.entranceExam.scores) {
        doc.educationDetails.entranceExam.scores = {};
      }
      if (score !== undefined) {
        doc.educationDetails.entranceExam.scores.overall = score;
      }

      return doc;
    });

    await ShortlistModel.insertMany(docsToInsert);

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
        const subject = `🎉 Congratulations! Shortlisted for ${department.toUpperCase()} Admission`;

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
                <p>We are pleased to inform you that you have been <strong>shortlisted</strong> for admission based on your merit and application.</p>
                
                <div class="info-box">
                  <h3 style="margin-top: 0; color: #667eea;">📋 Selection Details</h3>
                  <div class="info-row">
                    <span class="label">Department:</span>
                    <span class="value"><strong>${department.toUpperCase()}</strong></span>
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
                  <strong>📌 Note:</strong> This is a system-generated email confirming your shortlist status. 
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
      totalSeats,
      shortlisted: docsToInsert.length,
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
    res.status(500).json({ success: false, error: error.message });
  }
};