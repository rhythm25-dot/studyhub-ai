// Small helpers so every controller sends responses in the exact same shape.
// Keeping this consistent makes the frontend's axios interceptor simple.

function success(res, statusCode, message, data = null, meta = null) {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
}

function error(res, statusCode, message, errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

module.exports = { success, error };
