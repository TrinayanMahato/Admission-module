const express = require('express');
const router = express.Router();

// Strictly using CommonJS require as type=module is removed
// Destructuring the functions from the applicants controller
const {
    createApplication,
    registerUser,
    confirmregisterUser
} = require('../controller/applicants.js');

const { verifyAuth } = require('../Middlewares/auth.js');

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

// Public routes - No authentication required
router.post('/register', registerUser);
router.post('/confirm-register', confirmregisterUser);

// Protected route - Requires authentication
// Body must include: { role: "user", ...otherData }
router.post('/submit-application', verifyAuth, upload.fields(documentFields), createApplication);

module.exports = router;