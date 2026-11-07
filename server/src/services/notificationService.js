const { isMemoryStore } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const Notification = require('../models/Notification');
const { emitEvent } = require('../config/socket');

async function createNotification(payload) {
  // TODO: Persist the notification and broadcast the 'notification:new' socket event.
  return null;
}

async function listNotifications(owner) {
  // TODO: Return the newest notifications for the owner.
  return [];
}

module.exports = { createNotification, listNotifications };
