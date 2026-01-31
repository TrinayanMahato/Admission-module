const express = require('express');
const router = express.Router();

// Strictly using CommonJS require as type=module is removed
// Destructuring the functions from the applicants controller
const {
    createAdmissionrcet,
    createAdmissionbtech,
    createAdmissionllb,
    registerUser,
    confirmregisterUser
} = require('../controller/applicants.js');

// Define Routes
// Define Routes
const upload = require('../config/multer.js');

const documentFields = [
    { name: 'marksheet12', maxCount: 1 },
    { name: 'birthCertificate', maxCount: 1 },
    { name: 'leavingCertificate', maxCount: 1 },
    { name: 'aadharCard', maxCount: 1 },
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'categoryCertificate', maxCount: 1 }
];

router.post('/submitapplicationrcet', upload.fields(documentFields), createAdmissionrcet);
router.post('/submitapplicationbtech', upload.fields(documentFields), createAdmissionbtech);
router.post('/submitapplicationllb', upload.fields(documentFields), createAdmissionllb);
router.post('/register', registerUser);

// Changed to match your controller logic (using userId and code in body)
router.post('/confirm-register', confirmregisterUser);

module.exports = router;