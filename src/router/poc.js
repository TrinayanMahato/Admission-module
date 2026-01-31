const express = require('express');
const router = express.Router();
const { 
  getApplicationsByDepartment,
  getShortlistedByDepartment,
  getFinalListByDepartment
} = require('../controller/poc');

// Get all applications by department
router.get('/applications', getApplicationsByDepartment);

// Get shortlisted applications by department
router.get('/shortlisted', getShortlistedByDepartment);

// Get final list by department
router.get('/final-list', getFinalListByDepartment);

module.exports = router;