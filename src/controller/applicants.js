
const RCET_applicants = require('../models/RCET_applicants');
const Btech_applicants = require('../models/Btech_applicants');
const BBALLBapplicants = require('../models/Btech_applicants');

exports.createAdmissionrcet = async (req, res) => {
  try {
    // Data is already validated by Joi middleware before reaching here
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
 // Adjust the path to your model file

exports.createAdmissionbtech = async (req, res) => {
  try {
    // Data is already validated via Joi middleware, so we use req.body directly
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
    // Data is already validated via Joi middleware
    const newApplicant = new BBALLBapplicants(req.body);
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

