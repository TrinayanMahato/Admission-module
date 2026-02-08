const express = require('express');
const router = express.Router();

const {
  createSuperAdmin,
  createpoc,
  getApplicants,
  getApplicantById,
  // Department management
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  // Course management
  createCourse,
  getAllCourses,
  getCoursesByDepartment,
  getCourseById,
  updateCourse,
  deleteCourse
} = require('../controller/super_admin.js');

const { superAdminValidationSchema } = require('../utils/joi/superAdmin.js');
const { pocValidationSchema } = require('../utils/joi/pocSchema.js');
const { verifyAuth } = require('../Middlewares/auth.js');
const { validate } = require('../Middlewares/validator.js');

// Super Admin & POC creation
router.post('/create/superadmin', verifyAuth, validate(superAdminValidationSchema), createSuperAdmin);
router.post('/create/poc', verifyAuth, validate(pocValidationSchema), createpoc);

// Applicants
router.get('/applicants', verifyAuth, getApplicants);
router.get('/applicants/:id', verifyAuth, getApplicantById);

// Department routes
router.post('/departments', verifyAuth, createDepartment);
router.get('/departments', verifyAuth, getAllDepartments);
router.get('/departments/:id', verifyAuth, getDepartmentById);
router.patch('/departments/:id', verifyAuth, updateDepartment);
router.delete('/departments/:id', verifyAuth, deleteDepartment);

// Course routes
router.post('/courses', verifyAuth, createCourse);
router.get('/courses', verifyAuth, getAllCourses);
router.get('/courses/by-department/:deptId', verifyAuth, getCoursesByDepartment);
router.get('/courses/:id', verifyAuth, getCourseById);
router.patch('/courses/:id', verifyAuth, updateCourse);
router.delete('/courses/:id', verifyAuth, deleteCourse);

module.exports = router;