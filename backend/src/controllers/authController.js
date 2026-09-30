const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');
const userModel = require('../models/userModel');
const { generateAuthToken, generateRandomToken } = require('../utils/tokenUtils');
const emailService = require('../services/emailService');

// Never return the password hash to the client.
function sanitizeUser(user) {
  const { password, verification_token, reset_token, reset_token_expires, ...safe } = user;
  return safe;
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = generateRandomToken();

  const user = await userModel.create({
    name,
    email,
    password: hashedPassword,
    role: role || 'student',
    verificationToken,
  });

  // Don't let a flaky SMTP server fail the whole registration.
  try {
    await emailService.sendVerificationEmail(email, name, verificationToken);
  } catch (err) {
    console.error('Failed to send verification email:', err.message);
  }

  return success(res, 201, 'Account created. Please check your email to verify your account.', {
    user: sanitizeUser(user),
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.is_active) {
    throw new ApiError(403, 'Your account has been deactivated. Contact an administrator.');
  }

  const token = generateAuthToken(user);
  return success(res, 200, 'Login successful', { user: sanitizeUser(user), token });
});

// GET /api/auth/verify-email/:token
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await userModel.findByVerificationToken(token);
  if (!user) {
    throw new ApiError(400, 'Invalid or expired verification link');
  }

  await userModel.markVerified(user.id);
  return success(res, 200, 'Email verified successfully. You can now log in.');
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findByEmail(email);

  // Always respond the same way, whether or not the email exists,
  // so attackers can't use this endpoint to discover valid accounts.
  if (user) {
    const token = generateRandomToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await userModel.setResetToken(user.id, token, expiresAt);
    try {
      await emailService.sendPasswordResetEmail(user.email, user.name, token);
    } catch (err) {
      console.error('Failed to send password reset email:', err.message);
    }
  }

  return success(res, 200, 'If that email is registered, a reset link has been sent.');
});

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const user = await userModel.findByResetToken(token);
  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset link');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await userModel.updatePassword(user.id, hashedPassword);

  return success(res, 200, 'Password reset successfully. You can now log in.');
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  return success(res, 200, 'Current user fetched', { user: sanitizeUser(req.user) });
});

// POST /api/auth/logout
// Stateless JWT - logout is handled client-side by discarding the token.
// This endpoint exists mainly for symmetry / future token-blacklisting.
const logout = asyncHandler(async (req, res) => {
  return success(res, 200, 'Logged out successfully');
});

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
  sanitizeUser,
};
