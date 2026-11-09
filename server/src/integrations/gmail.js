const { requestWithRetry } = require('./baseIntegration');

function base64Url(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function listMessages(token, query = 'newer_than:1d') {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`;
  return requestWithRetry({ method: 'GET', url, token });
}

async function sendEmail(token, { to, subject = 'AI Operations Automation', body = '', cc, bcc }) {
  if (!to) throw new Error('Recipient email is required for sendEmail');

  const lines = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0'
  ];
  if (cc) lines.push(`Cc: ${cc}`);
  if (bcc) lines.push(`Bcc: ${bcc}`);
  lines.push('', body);

  const raw = base64Url(lines.join('\r\n'));
  const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
  return requestWithRetry({
    method: 'POST',
    url,
    token,
    data: { raw }
  });
}

module.exports = { listMessages, sendEmail, base64Url };
