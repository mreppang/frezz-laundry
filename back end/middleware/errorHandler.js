const asyncHandler = require("../utils/asyncHandler");

function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token sudah kedaluwarsa.',
    });
  }

  // Handle custom status codes
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle database errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: 'Data sudah ada.',
    });
  }

  // Default error
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message: message,
  });
}

function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan.",
  });
}

module.exports = {
  errorHandler,
  notFound,
};
