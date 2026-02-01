const express = require('express');
const router = express.Router();

// Strictlyusing CommonJS require as type=module is removed
// Destructuring the functions from the applicants controller
const {
    createApplication,
    registerUser,
    confirmregisterUser
} = require('../controller/applicants.js');

// Define Routes
const upload = require('../config/multer.js');

const documentFields = [
    { name: 'marksheet12', maxCount: 1 },
    { name: 'birthCertificate', maxCount: 1 },
    { name: 'leavingCertificate', maxCount: 1 },
    { name: 'aadharCard', maxCount: 1 },
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'categoryCertificate', maxCount: 1 },
    { name: 'disabilityCertificate', maxCount: 1 }
];

// Unified application submission route
router.post('/submit-application', upload.fields(documentFields), createApplication);

// User registration routes
router.post('/register', registerUser);
router.post('/confirm-register', confirmregisterUser);

module.exports = router;