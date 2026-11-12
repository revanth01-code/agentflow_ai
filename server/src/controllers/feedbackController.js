const nodemailer = require('nodemailer');
require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

const adminEmail = process.env.FEEDBACK_ADMIN_EMAIL || 'grevanth993@gmail.com';

function createTransporter() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    throw new ApiError(503, 'Feedback email service is not configured.', {
      code: 'FEEDBACK_EMAIL_NOT_CONFIGURED'
    });
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD
    }
  });
}

const sendFeedback = asyncHandler(async (req, res) => {
  const message = String(req.body.message || '').trim();
  if (!message) {
    throw new ApiError(400, 'Feedback message is required.', { code: 'MISSING_FEEDBACK' });
  }

  const senderEmail = req.user.email;
  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: adminEmail,
      replyTo: senderEmail,
      subject: `Agentflow feedback from ${senderEmail}`,
      text: `User: ${senderEmail}\n\n${message}`
    });
  } catch (_err) {
    throw new ApiError(502, 'Feedback could not be sent. Please try again later.', {
      code: 'FEEDBACK_SEND_FAILED'
    });
  }

  res.status(202).json({ message: 'Feedback sent successfully' });
});

module.exports = { sendFeedback };
