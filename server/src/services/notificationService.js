const { isMemoryStore } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const Notification = require('../models/Notification');
const { emitEvent } = require('../config/socket');

async function createNotification(payload) {
  const data = {
    owner: String(payload.owner),
    workflow: payload.workflow ? String(payload.workflow) : null,
    execution: payload.execution ? String(payload.execution) : null,
    type: payload.type || 'info',
    title: payload.title || 'Notification',
    message: payload.message || '',
    read: false
  };

  let saved;
  if (isMemoryStore()) {
    saved = memoryStore.insert('notifications', data);
  } else {
    saved = await Notification.create(data);
  }

  emitEvent(null, 'notification:new', saved);
  return saved;
}

async function listNotifications(owner) {
  const ownerId = String(owner._id || owner);
  if (isMemoryStore()) {
    const list = memoryStore.list('notifications', { owner: ownerId });
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return Notification.find({ owner: ownerId }).sort({ createdAt: -1 }).limit(50).lean();
}

module.exports = { createNotification, listNotifications };
