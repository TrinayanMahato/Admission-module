const express = require('express');
const router = express.Router();

const {
  createSuperAdmin,
  createpoc,
  getApplicants,
  getApplicantById
} = require('../controller/super_admin.js');

const { superAdminValidationSchema } = require('../utils/joi/poc.js');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    next();
  };
};

router.post('/create/superadmin', validate(superAdminValidationSchema), createSuperAdmin);
router.post('/create/poc', validate(superAdminValidationSchema), createpoc);

// Unified Applicants Routes
// Query params: departmentId, courseId, status (all optional)
router.get('/applicants', getApplicants);
router.get('/applicants/:id', getApplicantById);

module.exports = router;