const express = require('express');
const router = express.Router();
const {
  getApplicationsByDepartment,
  getShortlistedByDepartment,
  getFinalListByDepartment,
  generateShortlist
} = require('../controller/poc');
const { verifyAuth } = require('../Middlewares/auth');

// Get all applications by department (and optionally course)
// Query params: departmentId (required), courseId (optional)
// Body: { role: "admin" or "poc" }
router.get('/applications', verifyAuth, getApplicationsByDepartment);

// Get shortlisted applications by department (and optionally course)
// Query params: departmentId (required), courseId (optional)
// Body: { role: "admin" or "poc" }
router.get('/shortlisted', verifyAuth, getShortlistedByDepartment);

// Generate Shortlist (Auto-select based on rules)
// Body: { role: "admin" or "poc", departmentId, courseId, seats }
router.post('/generate-shortlist', verifyAuth, generateShortlist);

// Get final list by department (and optionally course)
// Query params: departmentId (required), courseId (optional)
// Body: { role: "admin" or "poc" }
router.get('/final-list', verifyAuth, getFinalListByDepartment);

module.exports = router;