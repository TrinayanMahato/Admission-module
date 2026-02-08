const express = require('express');
const router = express.Router();
const { checkPaymentStatus } = require('../controller/payment_controller');
const { verifyAuth } = require('../Middlewares/auth');

// Check payment status route
// Protected route - Requires authentication
// Body must include: { role: "user" }
router.get('/check/:userId', verifyAuth, checkPaymentStatus);

module.exports = router;
