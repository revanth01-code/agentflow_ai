const crypto = require('crypto');
const env = require('../config/env');

function encryptionKey() {
  const secret = env.credentialEncryptionKey || env.jwtSecret || 'agentflow_default_key';
  return crypto.createHash('sha256').update(String(secret)).digest();
}

function encrypt(value = '') {
  if (!value) return '';
  const key = encryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(String(value), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${tag}:${encrypted}`;
}

function decrypt(payload = '') {
  if (!payload || typeof payload !== 'string') return '';
  const parts = payload.split(':');
  if (parts.length !== 3) return payload;
  try {
    const key = encryptionKey();
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(parts[2], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (_err) {
    return '';
  }
}

module.exports = { encrypt, decrypt };
