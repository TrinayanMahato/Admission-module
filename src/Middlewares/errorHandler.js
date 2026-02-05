// Global Error Handler Middleware
module.exports = (err, req, res, next) => {
    // Set default status code if not provided
    err.statusCode = err.statusCode || 500;

    // Log error for debugging (optional - can be removed in production)
    console.error('Error:', err.message);
    console.error('Status Code:', err.statusCode);

    let message;

    // Determine message based on status code
    if (`${err.statusCode}`.startsWith('4')) {
        // Client errors (4xx)
        message = "Some error occurred";
    } else {
        // Server errors (5xx)
        message = "Internal server error";
    }

    // Send generic error response
    res.status(err.statusCode).json({
        success: false,
        message: message
    });
};
