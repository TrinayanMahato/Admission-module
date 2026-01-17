// Strictly using CommonJS require as type=module is removed
const SuperAdmin = require('../Models/super_admin.js');
const RCET_applicants = require('../Models/rcet candidates.js');
const Btech_applicants = require('../Models/Btech applicants.js');
const BBA_LLB_applicants = require('../Models/BBA LLB applicants.js');

// --- SUPER ADMIN / POC CONTROLLERS ---

exports.createSuperAdmin = async (req, res, next) => {
  try {
    const existingAdmin = await SuperAdmin.findOne({ email: req.body.email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const newAdmin = await SuperAdmin.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { admin: newAdmin }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createpoc = async (req, res, next) => {
  try {
    const existingAdmin = await SuperAdmin.findOne({ email: req.body.email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const newAdmin = await SuperAdmin.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { admin: newAdmin }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- RCET APPLICANTS ---

exports.getrcetapplicants = async (req, res) => {
  try {
    const allAdmissions = await RCET_applicants.find({}).sort({ createdAt: -1 }).lean();
    if (!allAdmissions || allAdmissions.length === 0) {
      return res.status(200).json({ success: true, message: "No records found.", count: 0, data: [] });
    }
    res.status(200).json({ success: true, count: allAdmissions.length, data: allAdmissions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getrcetapplicantsbyid = async (req, res) => {
  try {
    const { id } = req.params;
    const admissionData = await RCET_applicants.findById(id).lean();
    if (!admissionData) {
      return res.status(404).json({ success: false, message: "No record found with this ID." });
    }
    res.status(200).json({ success: true, data: admissionData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- BTECH APPLICANTS ---

exports.getbtechapplicants = async (req, res) => {
  try {
    const allAdmissions = await Btech_applicants.find({}).sort({ createdAt: -1 }).lean();
    if (!allAdmissions || allAdmissions.length === 0) {
      return res.status(200).json({ success: true, message: "No records found.", count: 0, data: [] });
    }
    res.status(200).json({ success: true, count: allAdmissions.length, data: allAdmissions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getbtechapplicantsbyid = async (req, res) => {
  try {
    const { id } = req.params;
    const admissionData = await Btech_applicants.findById(id).lean();
    if (!admissionData) {
      return res.status(404).json({ success: false, message: "No record found with this ID." });
    }
    res.status(200).json({ success: true, data: admissionData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- LLB APPLICANTS ---

exports.getllbapplicants = async (req, res) => {
  try {
    const allAdmissions = await BBA_LLB_applicants.find({}).sort({ createdAt: -1 }).lean();
    if (!allAdmissions || allAdmissions.length === 0) {
      return res.status(200).json({ success: true, message: "No records found.", count: 0, data: [] });
    }
    res.status(200).json({ success: true, count: allAdmissions.length, data: allAdmissions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getllbapplicantsbyid = async (req, res) => {
  try {
    const { id } = req.params;
    const admissionData = await BBA_LLB_applicants.findById(id).lean();
    if (!admissionData) {
      return res.status(404).json({ success: false, message: "No record found with this ID." });
    }
    res.status(200).json({ success: true, data: admissionData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};