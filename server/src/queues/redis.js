const IORedis = require('ioredis');
const env = require('../config/env');

let connection = null;

function getRedisConnection() {
  // TODO: Create a lazy ioredis connection when env.redisUrl is set and reuse it.
  return connection;
}

module.exports = { getRedisConnection };
