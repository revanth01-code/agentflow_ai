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
  openRouterModel: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || '',
  googleSheetsRedirectUri: process.env.GOOGLE_SHEETS_REDIRECT_URI || '',
  slackClientId: process.env.SLACK_CLIENT_ID || '',
  slackClientSecret: process.env.SLACK_CLIENT_SECRET || '',
  slackRedirectUri: process.env.SLACK_REDIRECT_URI || '',
  discordClientId: process.env.DISCORD_CLIENT_ID || '',
  discordClientSecret: process.env.DISCORD_CLIENT_SECRET || '',
  discordRedirectUri: process.env.DISCORD_REDIRECT_URI || '',
  discordBotToken: process.env.DISCORD_BOT_TOKEN || '',
  credentialEncryptionKey: process.env.CREDENTIAL_ENCRYPTION_KEY || ''
};

module.exports = env;
