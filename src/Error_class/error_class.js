class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Helps distinguish "expected" errors from bugs

    // Maintains proper stack trace for where our error was thrown (Node specific)
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
