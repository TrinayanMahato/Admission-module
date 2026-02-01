const SuperAdmin = require('../Models/super_admin');
const POC = require('../Models/poc');
const Application = require('../Models/application');

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

    const newAdmin = await POC.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { admin: newAdmin }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- UNIFIED APPLICANTS ---

exports.getApplicants = async (req, res) => {
  try {
    const { departmentId, courseId, status } = req.query;

    const filter = {};
    if (departmentId) filter.departmentId = departmentId;
    if (courseId) filter.courseId = courseId;
    if (status) filter.status = status;

    const allAdmissions = await Application.find(filter)
      .populate('departmentId')
      .populate('courseId')
      .sort({ createdAt: -1 })
      .lean();

    if (!allAdmissions || allAdmissions.length === 0) {
      return res.status(200).json({ success: true, message: "No records found.", count: 0, data: [] });
    }
    res.status(200).json({ success: true, count: allAdmissions.length, data: allAdmissions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getApplicantById = async (req, res) => {
  try {
    const { id } = req.params;
    const admissionData = await Application.findById(id)
      .populate('departmentId')
      .populate('courseId')
      .lean();

    if (!admissionData) {
      return res.status(404).json({ success: false, message: "No record found with this ID." });
    }
    res.status(200).json({ success: true, data: admissionData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};