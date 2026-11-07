const dotenv = require('dotenv');

dotenv.config();

const env = {
  port: process.env.PORT || 5050,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5050}`,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  redisUrl: process.env.REDIS_URL || '',
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
  openRouterModel: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  slackClientId: process.env.SLACK_CLIENT_ID || '',
  slackClientSecret: process.env.SLACK_CLIENT_SECRET || '',
  discordBotToken: process.env.DISCORD_BOT_TOKEN || '',
  credentialEncryptionKey: process.env.CREDENTIAL_ENCRYPTION_KEY || ''
};

module.exports = env;
