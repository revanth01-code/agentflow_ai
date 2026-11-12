const nodemailer = require('nodemailer');
require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const Feedback = require('../models/Feedback');
const { isMemoryStore } = require('../config/db');
const memoryStore = require('../utils/memoryStore');

const adminEmail = process.env.FEEDBACK_ADMIN_EMAIL || 'grevanth993@gmail.com';

function createTransporter() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    return null;
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
  const submittedAt = new Date();
  const userId = String(req.user._id || req.user.id);
  const feedbackData = {
    user: userId,
    email: senderEmail,
    message,
    status: 'unread'
  };

  const feedback = isMemoryStore()
    ? memoryStore.insert('feedback', feedbackData)
    : await Feedback.create(feedbackData);

  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: adminEmail,
        replyTo: senderEmail,
        subject: `Agentflow feedback from ${senderEmail}`,
        text: `User: ${senderEmail}\nTimestamp: ${submittedAt.toISOString()}\n\n${message}`
      });
    } catch (error) {
      console.error('Feedback notification email failed:', error.message);
    }
  } else {
    console.warn('Feedback notification email skipped: SMTP is not configured.');
  }

  res.status(202).json({ message: 'Feedback saved successfully', feedbackId: feedback._id });
});

module.exports = { sendFeedback };
