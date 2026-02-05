const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SuperAdmin = require('../Models/super_admin');
const POC = require('../Models/poc');
const User = require('../Models/user');
const AppError = require('../Error_class/error_class');

// Login endpoint
exports.login = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        // Validate input
        if (!email || !password || !role) {
            throw new AppError('Email, password, and role are required', 400);
        }

        // Validate role
        const validRoles = ['admin', 'poc', 'user'];
        if (!validRoles.includes(role)) {
            throw new AppError(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
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
            throw new AppError('Invalid credentials', 401);
        }

        // Compare password with hashed password in database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401);
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
        // Pass error to global error handler
        next(error);
    }
};
