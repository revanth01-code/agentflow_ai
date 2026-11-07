const mongoose = require('mongoose');

// TODO: Define the fields: owner, workflow, execution, type, title, message, read.
const NotificationSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
