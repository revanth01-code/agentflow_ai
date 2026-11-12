const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  status: { type: String, enum: ['unread', 'read'], default: 'unread' }
}, { timestamps: true });

FeedbackSchema.index({ status: 1, createdAt: -1 });
FeedbackSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', FeedbackSchema);
