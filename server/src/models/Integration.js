const mongoose = require('mongoose');

// TODO: Define the fields: owner, provider ('gmail' | 'slack' | 'google-sheets' | 'discord' |
// TODO: 'openrouter' | 'gemini'), status ('connected' | 'disconnected' | 'error'), scopes,
// TODO: encryptedAccessToken, encryptedRefreshToken, expiresAt, lastError.
// TODO: Add the unique compound index on owner + provider.
const IntegrationSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('Integration', IntegrationSchema);
