// Strictly using CommonJS require as type=module is removed
const RCET_applicants = require('../Models/rcet candidates.js');
const Btech_applicants = require('../Models/Btech applicants.js');
const BBA_LLB_applicants = require('../Models/BBA LLB applicants.js');
const User = require('../Models/user.js');
const tempUser = require('../Models/temp users.js');
const { sendMail } = require('../utils/email.js');

exports.createAdmissionrcet = async (req, res) => {
  try {
    const admissionData = new RCET_applicants(req.body);
    const savedAdmission = await admissionData.save();

    res.status(201).json({
      success: true,
      message: "Admission record created successfully",
      data: savedAdmission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database insertion failed",
      error: error.message
    });
  }
};

exports.createAdmissionbtech = async (req, res) => {
  try {
    const newAdmission = new Btech_applicants(req.body);
    const savedAdmission = await newAdmission.save();

    res.status(201).json({
      success: true,
      message: "Admission record created successfully",
      data: savedAdmission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while saving the record",
      error: error.message
    });
  }
};

exports.createAdmissionllb = async (req, res) => {
  try {
    const newApplicant = new BBA_LLB_applicants(req.body);
    const savedApplicant = await newApplicant.save();

    res.status(201).json({
      success: true,
      message: "Applicant record created successfully",
      data: savedApplicant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create record",
      error: error.message
    });
  }
};

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

    const newUser = new tempUser({
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

exports.confirmregisterUser = async (req, res) => {
  try {
    const { userId, code } = req.body;
    const user = await tempUser.findById(userId);

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

    const newUser = new User({
      userId: user._id, 
      fullName: user.fullName,
      email: user.email, 
      phone: user.phone,
      password: user.password,
      confirmPassword: user.confirmPassword
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