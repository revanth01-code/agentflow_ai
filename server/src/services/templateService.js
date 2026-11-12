const { isMemoryStore } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const Template = require('../models/Template');
const workflowService = require('./workflowService');

function ensureMemoryTemplates() {
  if (memoryStore.list('templates').length > 0) return;
  [
    ['Sheet to Email Summary', 'Read spreadsheet data, summarize it with AI, and email the result.', ['google-sheets', 'gmail', 'ai']],
    ['Slack AI Alerts', 'Generate an AI alert from workflow input and post it to Slack.', ['slack', 'ai']],
    ['Human Approval Notification', 'Pause for human input, then send the response to Slack.', ['human-in-the-loop', 'slack']]
  ].forEach(([name, description, tags], index) => {
    memoryStore.insert('templates', {
      name,
      description,
      tags,
      category: 'automation',
      isPublished: true,
      workflow: {
        name,
        description,
        trigger: { type: 'manual', config: {} },
        nodes: [
          { id: 'manual_1', type: 'manual-trigger', label: 'Start', category: 'trigger', position: { x: 0, y: 0 }, config: {} },
          {
            id: `step_${index + 1}`,
            type: index === 2 ? 'human-in-the-loop' : 'ai-generate',
            label: index === 2 ? 'Request Input' : 'Generate Content',
            category: index === 2 ? 'logic' : 'ai',
            position: { x: 280, y: 0 },
            config: index === 2 ? { prompt: 'Provide the approval message.' } : { prompt: 'Generate a concise workflow update.', input: '{{manual_1.output}}' }
          }
        ],
        edges: [{ id: `e-${index + 1}`, source: 'manual_1', target: `step_${index + 1}` }]
      }
    });
  });
}

async function listTemplates() {
  if (isMemoryStore()) {
    ensureMemoryTemplates();
    return memoryStore.list('templates', { isPublished: true });
  }
  return Template.find({ isPublished: true }).sort({ createdAt: 1 }).lean();
}

async function useTemplate(id, owner) {
  const template = isMemoryStore()
    ? memoryStore.findOne('templates', { _id: String(id), isPublished: true })
    : await Template.findOne({ _id: id, isPublished: true }).lean();
  if (!template) {
    const error = new Error('Template not found');
    error.statusCode = 404;
    throw error;
  }
  return workflowService.createWorkflow({
    ...template.workflow,
    name: template.workflow.name || template.name,
    description: template.workflow.description || template.description,
    status: 'draft'
  }, owner);
}

module.exports = { listTemplates, useTemplate };
