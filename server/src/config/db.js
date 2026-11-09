const mongoose = require('mongoose');
const env = require('./env');

let usingMemoryStore = true;

async function connectDatabase() {
  if (!env.mongoUri) {
    usingMemoryStore = true;
    return { status: 'memory-fallback', reason: 'MONGO_URI not provided' };
  }

  try {
    await mongoose.connect(env.mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000
    });
    usingMemoryStore = false;
    return { status: 'connected' };
  } catch (error) {
    usingMemoryStore = true;
    return { status: 'memory-fallback', reason: error.message };
  }
}

function isMemoryStore() {
  return usingMemoryStore || mongoose.connection.readyState !== 1;
}

module.exports = { connectDatabase, isMemoryStore };
