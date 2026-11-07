const { nanoid } = require('nanoid');

const collections = {
  users: [],
  workflows: [],
  executions: [],
  executionLogs: [],
  integrations: [],
  notifications: [],
  agentMemory: []
};

function now() {
  return new Date().toISOString();
}

function clone(value) {
  // TODO: Return a deep copy so callers cannot mutate the stored records.
  return value;
}

function insert(collection, data) {
  // TODO: Push a record with a generated _id plus createdAt / updatedAt and return a copy.
  return null;
}

function list(collection, filter = {}) {
  // TODO: Return the records in the collection that match every filter entry.
  return [];
}

function findOne(collection, filter = {}) {
  // TODO: Return the first record that matches every filter entry, or null.
  return null;
}

function update(collection, id, patch) {
  // TODO: Merge the patch into the matching record, refresh updatedAt, and return a copy.
  return null;
}

function remove(collection, id) {
  // TODO: Delete the matching record and report whether it existed.
  return false;
}

module.exports = { collections, insert, list, findOne, update, remove };
