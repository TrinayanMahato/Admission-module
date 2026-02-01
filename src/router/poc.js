const express = require('express');
const router = express.Router();
const {
  getApplicationsByDepartment,
  getShortlistedByDepartment,
  getFinalListByDepartment,
  generateShortlist
} = require('../controller/poc');

// Get all applications by department (and optionally course)
// Query params: departmentId (required), courseId (optional)
router.get('/applications', getApplicationsByDepartment);

// Get shortlisted applications by department (and optionally course)
// Query params: departmentId (required), courseId (optional)
router.get('/shortlisted', getShortlistedByDepartment);

// Generate Shortlist (Auto-select based on rules)
// Body: { departmentId, courseId, seats }
router.post('/generate-shortlist', generateShortlist);

// Get final list by department (and optionally course)
// Query params: departmentId (required), courseId (optional)
router.get('/final-list', getFinalListByDepartment);

module.exports = router;