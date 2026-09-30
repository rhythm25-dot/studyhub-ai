const transporter = require('../config/mailer');

async function sendVerificationEmail(to, name, token) {
  const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Verify your StudyHub AI account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2>Welcome to StudyHub AI, ${name}!</h2>
        <p>Please verify your email address to activate your account.</p>
        <a href="${link}" style="display:inline-block;padding:10px 20px;background:#4F46E5;color:#fff;
           text-decoration:none;border-radius:6px;">Verify Email</a>
        <p style="margin-top:16px;color:#666;font-size:13px;">
          Or copy this link: ${link}
        </p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(to, name, token) {
  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Reset your StudyHub AI password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2>Hi ${name},</h2>
        <p>We received a request to reset your password. This link expires in 1 hour.</p>
        <a href="${link}" style="display:inline-block;padding:10px 20px;background:#4F46E5;color:#fff;
           text-decoration:none;border-radius:6px;">Reset Password</a>
        <p style="margin-top:16px;color:#666;font-size:13px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
