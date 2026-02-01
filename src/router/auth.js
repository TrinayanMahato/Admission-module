const express = require('express');
const router = express.Router();
const { login } = require('../controller/login_controller');

// Login route - public (no authentication required)
router.post('/login', login);

module.exports = router;
