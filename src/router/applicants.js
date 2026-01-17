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
router.post('/submitapplicationrcet', createAdmissionrcet);
router.post('/submitapplicationbtech', createAdmissionbtech);
router.post('/submitapplicationllb', createAdmissionllb);
router.post('/register', registerUser);

// Changed to match your controller logic (using userId and code in body)
router.post('/confirm-register', confirmregisterUser);

module.exports = router;