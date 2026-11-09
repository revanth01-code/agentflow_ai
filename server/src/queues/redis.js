const IORedis = require('ioredis');
const env = require('../config/env');

let connection = null;

function getRedisConnection() {
  if (connection) return connection;
  if (!env.redisUrl) return null;
  try {
    connection = new IORedis(env.redisUrl, {
      maxRetriesPerRequest: null,
      lazyConnect: true
    });
    return connection;
  } catch (_err) {
    return null;
  }
}

module.exports = { getRedisConnection };
