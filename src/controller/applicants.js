const Application = require('../Models/application');
const Department = require('../Models/department');
const Course = require('../Models/course');
const User = require('../Models/user');
const TempUser = require('../Models/temp users');
const { sendMail } = require('../utils/email');
const bcrypt = require('bcrypt');

// Unified application submission
exports.createApplication = async (req, res) => {
  try {
    const { departmentId, courseId, ...applicationData } = req.body;

    // Verify department exists
    const department = await Department.findById(departmentId);
    if (!department || !department.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Department not found or inactive'
      });
    }

    // Verify course exists and belongs to department
    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or inactive'
      });
    }

    if (course.departmentId.toString() !== departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Course does not belong to the specified department'
      });
    }

    // Create application
    const newApplication = new Application({
      ...applicationData,
      departmentId,
      courseId
    });

    // Handle file uploads
    if (req.files) {
      if (!newApplication.documents) newApplication.documents = {};
      const fileFields = ['marksheet12', 'birthCertificate', 'leavingCertificate', 'aadharCard', 'profilePhoto', 'signature', 'categoryCertificate', 'disabilityCertificate'];

      fileFields.forEach(field => {
        if (req.files[field] && req.files[field].length > 0) {
          newApplication.documents[field] = '/uploads/' + req.files[field][0].filename;
        }
      });
    }

    const savedApplication = await newApplication.save();
    const populatedApplication = await Application.findById(savedApplication._id)
      .populate('departmentId')
      .populate('courseId');

    res.status(201).json({
      success: true,
      message: "Application created successfully",
      data: populatedApplication
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create application",
      error: error.message
    });
  }
};

// Register user
exports.registerUser = async (req, res) => {
  try {
    const { email, fullName } = req.body;

    const registrationCode = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const subject = "Your Registration Code";
    const htmlContent = `
      <h1>Hello ${fullName},</h1>
      <p>Thank you for registering! Your 10-digit registration code is:</p>
      <h2 style="color: #4A90E2; letter-spacing: 2px;">${registrationCode}</h2>
      <p>Please keep this code safe.</p>
    `;

    const emailResult = await sendMail(email, subject, htmlContent);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Registration failed: Email service error.",
        error: emailResult.error
      });
    }

    const newUser = new TempUser({
      ...req.body,
      code: registrationCode
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully and code emailed",
      data: {
        id: savedUser._id,
        email: savedUser.email,
        code: savedUser.code
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }
    res.status(500).json({ success: false, message: "Registration failed", error: error.message });
  }
};

// Confirm user registration
exports.confirmregisterUser = async (req, res) => {
  try {
    const { userId, code } = req.body;
    const user = await TempUser.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.code !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code"
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = new User({
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      applicationFees: 'due' // Default status
    });

    await newUser.save();

    res.status(200).json({
      success: true,
      message: "Code verified successfully!",
      data: {
        userId: user._id,
        email: user.email,
        verified: true
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Verification process failed",
      error: error.message
    });
  }
};