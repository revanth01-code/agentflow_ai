const { nanoid } = require('nanoid');

const collections = {
  users: [],
  workflows: [],
  executions: [],
  executionLogs: [],
  integrations: [],
  notifications: [],
  agentMemory: [],
  feedback: [],
  templates: []
};

function now() {
  return new Date().toISOString();
}

function clone(value) {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value));
}

function insert(collection, data) {
  if (!collections[collection]) {
    collections[collection] = [];
  }
  const timestamp = now();
  const record = {
    _id: data && data._id ? String(data._id) : nanoid(),
    ...clone(data),
    createdAt: data && data.createdAt ? data.createdAt : timestamp,
    updatedAt: data && data.updatedAt ? data.updatedAt : timestamp
  };
  collections[collection].push(record);
  return clone(record);
}

function list(collection, filter = {}) {
  const records = collections[collection] || [];
  const entries = Object.entries(filter || {});
  if (entries.length === 0) return records.map(clone);
  return records
    .filter((item) => entries.every(([key, val]) => String(item[key]) === String(val)))
    .map(clone);
}

function findOne(collection, filter = {}) {
  const records = collections[collection] || [];
  const entries = Object.entries(filter || {});
  const match = records.find((item) =>
    entries.every(([key, val]) => String(item[key]) === String(val))
  );
  return match ? clone(match) : null;
}

function update(collection, id, patch) {
  const records = collections[collection] || [];
  const index = records.findIndex((item) => String(item._id) === String(id));
  if (index === -1) return null;
  const existing = records[index];
  const updated = {
    ...existing,
    ...clone(patch),
    _id: existing._id,
    createdAt: existing.createdAt,
    updatedAt: now()
  };
  records[index] = updated;
  return clone(updated);
}

function remove(collection, id) {
  const records = collections[collection] || [];
  const index = records.findIndex((item) => String(item._id) === String(id));
  if (index === -1) return false;
  records.splice(index, 1);
  return true;
}

module.exports = { collections, insert, list, findOne, update, remove };
