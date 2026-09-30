const { validationResult } = require('express-validator');
const { error: sendError } = require('../utils/apiResponse');

// Runs after an array of express-validator checks on a route.
// If any check failed, respond with 422 and a clean list of field errors.
function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const formatted = result.array().map((e) => ({ field: e.path, message: e.msg }));
    return sendError(res, 422, 'Validation failed', formatted);
  }
  next();
}

module.exports = validate;
