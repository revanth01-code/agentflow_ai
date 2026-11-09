const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', default: null },
  execution: { type: mongoose.Schema.Types.ObjectId, ref: 'Execution', default: null },
  type: { type: String, default: 'info' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });

NotificationSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
