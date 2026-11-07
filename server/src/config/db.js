const mongoose = require('mongoose');
const env = require('./env');

let usingMemoryStore = true;

async function connectDatabase() {
  // TODO: Return the memory-fallback status when env.mongoUri is empty.
  // TODO: Otherwise connect with mongoose (autoIndex, serverSelectionTimeoutMS) and
  // TODO: return { status: 'connected' }, falling back to memory mode on failure.
  return { status: 'memory-fallback', reason: 'connectDatabase is not implemented yet' };
}

function isMemoryStore() {
  // TODO: Return true while the memory store is active or mongoose is not connected.
  return usingMemoryStore;
}

module.exports = { connectDatabase, isMemoryStore };
