const SuperAdmin = require('../Models/super_admin');
const POC = require('../Models/poc');
const Application = require('../Models/application');
const Department = require('../Models/department');
const Course = require('../Models/course');
const bcrypt = require('bcrypt');
const AppError = require('../Error_class/error_class');

// --- SUPER ADMIN / POC CONTROLLERS ---

exports.createSuperAdmin = async (req, res, next) => {
  try {
    const existingAdmin = await SuperAdmin.findOne({ email: req.body.email });
    if (existingAdmin) {
      throw new AppError('A user with this email already exists', 400);
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
    next(err);
  }
};

exports.createpoc = async (req, res, next) => {
  try {
    // Check if email exists in SuperAdmin table
    const existingAdmin = await SuperAdmin.findOne({ email: req.body.email });
    if (existingAdmin) {
      throw new AppError('A user with this email already exists', 400);
    }

    // Check if email exists in POC table
    const existingPOC = await POC.findOne({ email: req.body.email });
    if (existingPOC) {
      throw new AppError('A POC with this email already exists', 400);
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
    next(err);
  }
};

// --- UNIFIED APPLICANTS ---

exports.getApplicants = async (req, res, next) => {
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
    next(error);
  }
};

exports.getApplicantById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const admissionData = await Application.findById(id)
      .populate('departmentId')
      .populate('courseId')
      .lean();

    if (!admissionData) {
      throw new AppError('No record found with this ID', 404);
    }
    res.status(200).json({ success: true, data: admissionData });
  } catch (error) {
    next(error);
  }
};

// --- DEPARTMENT MANAGEMENT ---

exports.createDepartment = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;

    const existingDept = await Department.findOne({ code });
    if (existingDept) {
      throw new AppError('Department code already exists', 400);
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
    next(error);
  }
};

exports.getAllDepartments = async (req, res, next) => {
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
    next(error);
  }
};

exports.getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.code) {
      const existingDept = await Department.findOne({
        code: updates.code,
        _id: { $ne: id }
      });
      if (existingDept) {
        throw new AppError('Department code already exists', 400);
      }
    }

    const department = await Department.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const department = await Department.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Department deactivated successfully',
      data: department
    });
  } catch (error) {
    next(error);
  }
};

// --- COURSE MANAGEMENT ---

exports.createCourse = async (req, res, next) => {
  try {
    const { name, code, departmentId, duration, totalSeats } = req.body;

    const department = await Department.findById(departmentId);
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      throw new AppError('Course code already exists', 400);
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
    next(error);
  }
};

exports.getAllCourses = async (req, res, next) => {
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
    next(error);
  }
};

exports.getCoursesByDepartment = async (req, res, next) => {
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
    next(error);
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).populate('departmentId');

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.departmentId) {
      const department = await Department.findById(updates.departmentId);
      if (!department) {
        throw new AppError('Department not found', 404);
      }
    }

    if (updates.code) {
      const existingCourse = await Course.findOne({
        code: updates.code,
        _id: { $ne: id }
      });
      if (existingCourse) {
        throw new AppError('Course code already exists', 400);
      }
    }

    const course = await Course.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('departmentId');

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).populate('departmentId');

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Course deactivated successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};