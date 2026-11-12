require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../src/config/env');
const Template = require('../src/models/Template');

const templates = [
  {
    name: 'Sheet to Email Summary',
    description: 'Read recent spreadsheet data, summarize it with AI, and email the result.',
    category: 'productivity',
    tags: ['google-sheets', 'gmail', 'ai'],
    workflow: {
      name: 'Sheet to Email Summary',
      description: 'Read spreadsheet data, summarize it, and send an email.',
      trigger: { type: 'manual', config: {} },
      nodes: [
        { id: 'manual_1', type: 'manual-trigger', label: 'Start', category: 'trigger', position: { x: 0, y: 0 }, config: {} },
        { id: 'sheet_1', type: 'google-sheets-row', label: 'Read Sheet Data', category: 'action', position: { x: 260, y: 0 }, config: { spreadsheetId: '', range: 'Sheet1!A:Z', values: [] } },
        { id: 'ai_1', type: 'ai-summarization', label: 'Summarize Data', category: 'ai', position: { x: 520, y: 0 }, config: { prompt: 'Summarize the spreadsheet data', input: '{{sheet_1.output}}' } },
        { id: 'email_1', type: 'send-email', label: 'Email Summary', category: 'action', position: { x: 780, y: 0 }, config: { to: '', subject: 'Spreadsheet Summary', body: '{{ai_1.output}}' } }
      ],
      edges: [
        { id: 'e1', source: 'manual_1', target: 'sheet_1' },
        { id: 'e2', source: 'sheet_1', target: 'ai_1' },
        { id: 'e3', source: 'ai_1', target: 'email_1' }
      ]
    }
  },
  {
    name: 'Slack AI Alerts',
    description: 'Generate an AI alert from workflow input and post it to Slack.',
    category: 'notifications',
    tags: ['slack', 'ai'],
    workflow: {
      name: 'Slack AI Alerts',
      description: 'Generate an alert and post it to Slack.',
      trigger: { type: 'manual', config: {} },
      nodes: [
        { id: 'manual_1', type: 'manual-trigger', label: 'Start', category: 'trigger', position: { x: 0, y: 0 }, config: {} },
        { id: 'ai_1', type: 'ai-generate', label: 'Generate Alert', category: 'ai', position: { x: 300, y: 0 }, config: { prompt: 'Write a concise operational alert', input: '{{manual_1.output}}' } },
        { id: 'slack_1', type: 'send-slack-message', label: 'Post Alert', category: 'action', position: { x: 600, y: 0 }, config: { channel: '', text: '{{ai_1.output}}' } }
      ],
      edges: [
        { id: 'e1', source: 'manual_1', target: 'ai_1' },
        { id: 'e2', source: 'ai_1', target: 'slack_1' }
      ]
    }
  },
  {
    name: 'Human Approval Notification',
    description: 'Pause for human input, then send the response to Slack.',
    category: 'collaboration',
    tags: ['human-in-the-loop', 'slack'],
    workflow: {
      name: 'Human Approval Notification',
      description: 'Collect human input before notifying Slack.',
      trigger: { type: 'manual', config: {} },
      nodes: [
        { id: 'manual_1', type: 'manual-trigger', label: 'Start', category: 'trigger', position: { x: 0, y: 0 }, config: {} },
        { id: 'human_1', type: 'human-in-the-loop', label: 'Request Approval', category: 'logic', position: { x: 300, y: 0 }, config: { prompt: 'Enter the approval decision or message to send.' } },
        { id: 'slack_1', type: 'send-slack-message', label: 'Notify Slack', category: 'action', position: { x: 600, y: 0 }, config: { channel: '', text: '{{human_1.output.input}}' } }
      ],
      edges: [
        { id: 'e1', source: 'manual_1', target: 'human_1' },
        { id: 'e2', source: 'human_1', target: 'slack_1' }
      ]
    }
  }
];

async function seed() {
  if (!env.mongoUri) throw new Error('MONGO_URI is required to seed templates.');
  await mongoose.connect(env.mongoUri);
  await Template.deleteMany({});
  await Template.insertMany(templates);
  await mongoose.disconnect();
}

seed().then(() => process.stdout.write('Templates seeded.\n')).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
