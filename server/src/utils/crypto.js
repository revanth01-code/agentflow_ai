const crypto = require('crypto');
const env = require('../config/env');

function encryptionKey() {
  // TODO: Derive a 32 byte key by hashing the credential encryption key or the JWT secret.
  return null;
}

function encrypt(value = '') {
  // TODO: Encrypt the value with aes-256-gcm and return "iv:tag:ciphertext" in hex.
  return '';
}

function decrypt(payload = '') {
  // TODO: Split the stored payload, verify the auth tag, and return the plain text.
  return '';
}

module.exports = { encrypt, decrypt };
