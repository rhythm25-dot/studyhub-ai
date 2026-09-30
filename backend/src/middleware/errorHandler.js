const { error: sendError } = require('../utils/apiResponse');

// Catches anything thrown/passed to next() from asyncHandler-wrapped
// controllers or other middleware, and turns it into a clean JSON response.
// Must be registered LAST in server.js, after all routes.
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // MySQL duplicate entry (e.g. email already registered)
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'A record with this value already exists';
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return sendError(res, statusCode, message, err.errors || null);
}

// Handles requests to routes that don't exist.
function notFound(req, res, next) {
  return sendError(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
}

module.exports = { errorHandler, notFound };
