const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SuperAdmin = require('../Models/super_admin');
const POC = require('../Models/poc');
const User = require('../Models/user');

// Login endpoint
exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Validate input
        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and role are required'
            });
        }

        // Validate role
        const validRoles = ['admin', 'poc', 'user'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
            });
        }

        // Find user based on role
        let user;
        let Model;

        switch (role) {
            case 'admin':
                Model = SuperAdmin;
                break;
            case 'poc':
                Model = POC;
                break;
            case 'user':
                Model = User;
                break;
        }

        user = await Model.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Compare password with hashed password in database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: role,
                name: user.name || user.fullName
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '7d'
            }
        );

        // Return token and user info
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name || user.fullName,
                role: role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};
