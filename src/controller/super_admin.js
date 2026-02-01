const SuperAdmin = require('../Models/super_admin');
const POC = require('../Models/poc');
const Application = require('../Models/application');
const Department = require('../Models/department');
const Course = require('../Models/course');
const bcrypt = require('bcrypt');

// --- SUPER ADMIN / POC CONTROLLERS ---

exports.createSuperAdmin = async (req, res, next) => {
  try {
    const existingAdmin = await SuperAdmin.findOne({ email: req.body.email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newAdmin = await SuperAdmin.create({
      ...req.body,
      password: hashedPassword
    });

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

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newAdmin = await POC.create({
      ...req.body,
      password: hashedPassword
    });

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

// --- DEPARTMENT MANAGEMENT ---

exports.createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    const existingDept = await Department.findOne({ code });
    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'Department code already exists'
      });
    }

    const department = await Department.create({
      name,
      code,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = isActive !== undefined ? { isActive: isActive === 'true' } : {};

    const departments = await Department.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.code) {
      const existingDept = await Department.findOne({
        code: updates.code,
        _id: { $ne: id }
      });
      if (existingDept) {
        return res.status(400).json({
          success: false,
          message: 'Department code already exists'
        });
      }
    }

    const department = await Department.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Department deactivated successfully',
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// --- COURSE MANAGEMENT ---

exports.createCourse = async (req, res) => {
  try {
    const { name, code, departmentId, duration, totalSeats } = req.body;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course code already exists'
      });
    }

    const course = await Course.create({
      name,
      code,
      departmentId,
      duration,
      totalSeats
    });

    const populatedCourse = await Course.findById(course._id).populate('departmentId');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: populatedCourse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = isActive !== undefined ? { isActive: isActive === 'true' } : {};

    const courses = await Course.find(filter)
      .populate('departmentId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getCoursesByDepartment = async (req, res) => {
  try {
    const { deptId } = req.params;
    const { isActive } = req.query;

    const filter = { departmentId: deptId };
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const courses = await Course.find(filter)
      .populate('departmentId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).populate('departmentId');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.departmentId) {
      const department = await Department.findById(updates.departmentId);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }
    }

    if (updates.code) {
      const existingCourse = await Course.findOne({
        code: updates.code,
        _id: { $ne: id }
      });
      if (existingCourse) {
        return res.status(400).json({
          success: false,
          message: 'Course code already exists'
        });
      }
    }

    const course = await Course.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('departmentId');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).populate('departmentId');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course deactivated successfully',
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};