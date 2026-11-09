const mongoose = require('mongoose');

const IntegrationSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: {
    type: String,
    enum: ['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini'],
    required: true
  },
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'error'],
    default: 'disconnected'
  },
  scopes: [{ type: String }],
  encryptedAccessToken: { type: String, default: null },
  encryptedRefreshToken: { type: String, default: null },
  expiresAt: { type: Date, default: null },
  lastError: { type: String, default: null }
}, { timestamps: true });

IntegrationSchema.index({ owner: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Integration', IntegrationSchema);
