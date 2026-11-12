const { requestWithRetry } = require('./baseIntegration');

function base64Url(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function formatRecipient(value) {
  const recipient = String(value || '').trim();
  if (/[\r\n]/.test(recipient)) {
    throw new Error('Recipient email must not contain line breaks');
  }

  const namedRecipient = recipient.match(/^(.+?)\s*<\s*([^<>@\s]+@[^<>@\s]+)\s*>$/);
  if (namedRecipient) {
    return `${namedRecipient[1].trim()} <${namedRecipient[2]}>`;
  }
  return recipient;
}

async function listMessages(token, query = 'newer_than:1d') {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`;
  return requestWithRetry({ method: 'GET', url, token });
}

async function sendEmail(token, { to, subject = 'AI Operations Automation', body = '', cc, bcc }) {
  if (!to) throw new Error('Recipient email is required for sendEmail');

  const formattedRecipient = formatRecipient(to);
  const lines = [
    `To: ${formattedRecipient}`,
    `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0'
  ];
  if (cc) lines.push(`Cc: ${cc}`);
  if (bcc) lines.push(`Bcc: ${bcc}`);
  lines.push('', body);

  if (process.env.LOG_GMAIL_MIME === 'true') {
    console.log('[gmail] MIME lines:', lines);
  }

  const raw = base64Url(lines.join('\r\n'));
  const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
  return requestWithRetry({
    method: 'POST',
    url,
    token,
    data: { raw }
  });
}

module.exports = { listMessages, sendEmail, base64Url, formatRecipient };
