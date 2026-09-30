const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Signs a JWT carrying just the user id and role. We keep the payload
// small on purpose - anything else about the user should be fetched
// fresh from the DB when needed, not trusted from an old token.
function generateAuthToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// Random URL-safe tokens used for email verification and password reset links.
function generateRandomToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = { generateAuthToken, generateRandomToken };
