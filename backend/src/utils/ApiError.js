// A lightweight custom error class so controllers can throw errors
// with a specific HTTP status code, and the central error handler
// knows how to translate that into a response.
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
