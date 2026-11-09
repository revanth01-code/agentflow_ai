const axios = require('axios');

async function sendDiscordMessage(webhookUrl, content) {
  if (!webhookUrl) throw new Error('Discord webhook URL is required');
  const payload = typeof content === 'string' ? { content } : content;
  const response = await axios.post(webhookUrl, payload, { timeout: 15000 });
  return response.data;
}

module.exports = { sendDiscordMessage };
