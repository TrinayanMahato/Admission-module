const express = require('express');
const router = express.Router();
const {
  getApplicationsByDepartment,
  getShortlistedByDepartment,
  getFinalListByDepartment,
  generateShortlist,
  regenerateShortlist
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

// Regenerate Shortlist (Second/Subsequent Round - Auto-fill empty seats)
// Body: { role: "admin" or "poc", departmentId, courseId }
router.post('/regenerate-shortlist', verifyAuth, regenerateShortlist);

// Get final list by department (and optionally course)
// Query params: departmentId (required), courseId (optional)
// Body: { role: "admin" or "poc" }
router.get('/final-list', verifyAuth, getFinalListByDepartment);

module.exports = router;