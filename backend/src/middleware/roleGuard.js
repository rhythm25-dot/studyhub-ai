const ApiError = require('../utils/ApiError');

// Usage: roleGuard('teacher', 'admin') - only these roles may proceed.
// Must run after the `protect` middleware, since it relies on req.user.
const roleGuard = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized');
  }
  if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, `Role '${req.user.role}' is not permitted to perform this action`);
  }
  next();
};

module.exports = roleGuard;
