const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');
const userModel = require('../models/userModel');
const { sanitizeUser } = require('./authController');

// PATCH /api/users/me
const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, bio } = req.body;
  const avatarUrl = req.file ? req.file.path : undefined;

  const updated = await userModel.updateProfile(req.user.id, { name, bio, avatarUrl });
  return success(res, 200, 'Profile updated successfully', { user: sanitizeUser(updated) });
});

// GET /api/users  (admin only)
const listUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const { rows, total } = await userModel.findAll({ role, search, page, limit });
  return success(res, 200, 'Users fetched', { users: rows }, {
    page: Number(page), limit: Number(limit), total,
  });
});

// PATCH /api/users/:id/status  (admin only) - activate/deactivate a teacher or student
const setUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await userModel.findById(id);
  if (!user) throw new ApiError(404, 'User not found');

  await userModel.setActive(id, isActive ? 1 : 0);
  return success(res, 200, `User ${isActive ? 'activated' : 'deactivated'} successfully`);
});

// DELETE /api/users/:id  (admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userModel.findById(id);
  if (!user) throw new ApiError(404, 'User not found');

  await userModel.remove(id);
  return success(res, 200, 'User deleted successfully');
});

module.exports = { updateMyProfile, listUsers, setUserStatus, deleteUser };
