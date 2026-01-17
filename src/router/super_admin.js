const express = require('express');
const router = express.Router();

const { 
  createSuperAdmin, 
  createpoc, 
  getrcetapplicants, 
  getrcetapplicantsbyid, 
  getbtechapplicants, 
  getbtechapplicantsbyid, 
  getllbapplicants, 
  getllbapplicantsbyid 
} = require('../controller/super_admin.js');

const  {superAdminValidationSchema}  = require('../utils/joi/poc.js');

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

router.get('/rcetapplicants', getrcetapplicants);
router.get('/rcetapplicants/:id', getrcetapplicantsbyid);

router.get('/btechapplicants', getbtechapplicants);
router.get('/btechapplicants/:id', getbtechapplicantsbyid);

router.get('/llbapplicants', getllbapplicants);
router.get('/llbapplicants/:id', getllbapplicantsbyid);

module.exports = router;