const User = require('../Models/user');
const AppError = require('../Error_class/error_class');

// Check payment status of a user
exports.checkPaymentStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Check payment status
        const hasPaid = user.applicationFees === 'paid';

        res.status(200).json({
            success: true,
            hasPaid: hasPaid,
            applicationFees: user.applicationFees,
            message: hasPaid
                ? 'Payment status retrieved successfully'
                : 'Payment is pending',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                applicationFees: user.applicationFees
            }
        });

    } catch (error) {
        next(error);
    }
};
