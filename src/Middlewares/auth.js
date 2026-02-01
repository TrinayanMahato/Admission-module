const jwt = require('jsonwebtoken');
const SuperAdmin = require('../Models/super_admin');
const POC = require('../Models/poc');
const User = require('../Models/user');

// Single authentication middleware
const verifyAuth = async (req, res, next) => {
    try {
        // 1. Get role from request body
        const role = req.body.role;

        if (!role) {
            return res.status(401).json({
                success: false,
                message: 'Role is required in request body'
            });
        }

        // 2. Extract JWT token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];

        // 3. Verify and decode JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // 4. Check if user exists in the correct table based on role
        let user;

        if (role === 'admin') {
            user = await SuperAdmin.findById(userId);
        } else if (role === 'poc') {
            user = await POC.findById(userId);
        } else if (role === 'user') {
            user = await User.findById(userId);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be "admin", "poc", or "user"'
            });
        }

        // 5. If user not found in the specified table, deny access
        if (!user) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized. User not found in the specified role table.'
            });
        }

        // 6. Attach user info to request and allow access
        req.user = {
            id: userId,
            role: role,
            email: decoded.email,
            name: decoded.name,
            dbUser: user
        };

        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

module.exports = { verifyAuth };
