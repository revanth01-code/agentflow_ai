const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const { decrypt } = require('../utils/crypto');
const { isMemoryStore } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

const nodeCatalog = {
  triggers: ['gmail-trigger', 'webhook-trigger', 'schedule-trigger', 'manual-trigger', 'slack-trigger'],
  actions: ['send-email', 'send-slack-message', 'send-discord-message', 'google-sheets-row', 'http-request', 'database-insert'],
  ai: ['ai-classification', 'ai-extraction', 'ai-summarization', 'ai-decision', 'ai-validation', 'dynamic-routing'],
  logic: ['if-else', 'retry', 'delay', 'approval', 'parallel-execution']
};

function extractEmail(prompt = '') {
  const match = String(prompt).match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : '';
}

function extractQuotedText(prompt = '', fallback = '') {
  const matches = [...String(prompt).matchAll(/["']([^"']+)["']/g)];
  if (matches.length > 0) {
    return matches[matches.length - 1][1];
  }
  return fallback;
}

function extractSubject(prompt = '') {
  const match = String(prompt).match(/subject\s*[:=]?\s*["']([^"']+)["']/i);
  if (match) return match[1];
  return extractQuotedText(prompt, 'Automation Test');
}

function isEmailAutomationPrompt(prompt = '') {
  return /(send|email|mail|gmail|message)/i.test(prompt);
}

function buildEmailWorkflow(prompt = '') {
  const recipient = extractEmail(prompt) || 'recipient@example.com';
  const subject = extractSubject(prompt);
  const nodes = [
    {
      id: 'manual-trigger-1',
      type: 'manual-trigger',
      label: 'Manual Trigger',
      category: 'triggers',
      position: { x: 100, y: 150 },
      config: {},
      status: 'idle'
    },
    {
      id: 'send-email-1',
      type: 'send-email',
      label: 'Send Email',
      category: 'actions',
      position: { x: 420, y: 150 },
      config: {
        to: recipient,
        subject: subject,
        body: prompt || 'Automated message from AgentFlow AI'
      },
      status: 'idle'
    }
  ];
  const edges = [
    {
      id: 'e-manual-trigger-1-send-email-1',
      source: 'manual-trigger-1',
      target: 'send-email-1',
      animated: true
    }
  ];
  return {
    name: 'Email Operations Workflow',
    description: prompt,
    trigger: { type: 'manual', config: {} },
    nodes,
    edges,
    tags: ['email', 'operations']
  };
}

function buildFallbackWorkflow(prompt = '') {
  const promptLower = String(prompt).toLowerCase();
  let triggerType = 'manual-trigger';
  let triggerLabel = 'Manual Trigger';
  if (promptLower.includes('gmail') || promptLower.includes('email trigger')) {
    triggerType = 'gmail-trigger';
    triggerLabel = 'Gmail Trigger';
  } else if (promptLower.includes('webhook')) {
    triggerType = 'webhook-trigger';
    triggerLabel = 'Webhook Trigger';
  } else if (promptLower.includes('schedule') || promptLower.includes('cron')) {
    triggerType = 'schedule-trigger';
    triggerLabel = 'Schedule Trigger';
  }

  let actionType = 'send-email';
  let actionLabel = 'Send Email';
  if (promptLower.includes('discord')) {
    actionType = 'send-discord-message';
    actionLabel = 'Send Discord Message';
  } else if (promptLower.includes('slack')) {
    actionType = 'send-slack-message';
    actionLabel = 'Send Slack Message';
  } else if (promptLower.includes('sheet')) {
    actionType = 'google-sheets-row';
    actionLabel = 'Google Sheets Row';
  }

  const nodes = [
    {
      id: `${triggerType}-1`,
      type: triggerType,
      label: triggerLabel,
      category: 'triggers',
      position: { x: 100, y: 150 },
      config: {},
      status: 'idle'
    },
    {
      id: 'ai-extraction-1',
      type: 'ai-extraction',
      label: 'AI Data Extraction',
      category: 'ai',
      position: { x: 380, y: 150 },
      config: { prompt: prompt || 'Extract key entities' },
      status: 'idle'
    },
    {
      id: `${actionType}-1`,
      type: actionType,
      label: actionLabel,
      category: 'actions',
      position: { x: 680, y: 150 },
      config: {
        to: extractEmail(prompt) || 'team@example.com',
        subject: extractSubject(prompt),
        message: prompt
      },
      status: 'idle'
    },
    {
      id: 'approval-1',
      type: 'approval',
      label: 'Operator Approval',
      category: 'logic',
      position: { x: 960, y: 150 },
      config: { requireConfirmation: false },
      status: 'idle'
    }
  ];

  const edges = [
    {
      id: `e-${triggerType}-1-ai-extraction-1`,
      source: `${triggerType}-1`,
      target: 'ai-extraction-1',
      animated: true
    },
    {
      id: `e-ai-extraction-1-${actionType}-1`,
      source: 'ai-extraction-1',
      target: `${actionType}-1`,
      animated: true
    },
    {
      id: `e-${actionType}-1-approval-1`,
      source: `${actionType}-1`,
      target: 'approval-1',
      animated: true
    }
  ];

  return {
    name: 'AI Operations Workflow',
    description: prompt,
    trigger: { type: triggerType.replace('-trigger', ''), config: {} },
    nodes,
    edges,
    tags: ['agentic', 'workflow']
  };
}

function hasUsableNodes(graph) {
  return Boolean(
    graph &&
    Array.isArray(graph.nodes) &&
    graph.nodes.length > 0 &&
    graph.nodes.some((node) => node && node.id && node.type)
  );
}

function extractJson(text = '') {
  if (!text) return null;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (_err) {
    return null;
  }
  return null;
}

function sanitizeGeneratedWorkflow(graph, prompt = '') {
  if (!graph || !Array.isArray(graph.nodes)) return null;

  const validNodes = [];
  const knownIds = new Set();

  graph.nodes.forEach((node, index) => {
    if (!node || !node.type) return;
    const id = String(node.id || `${node.type}-${index + 1}`);
    knownIds.add(id);

    let category = node.category;
    if (!category) {
      if (nodeCatalog.triggers.includes(node.type)) category = 'triggers';
      else if (nodeCatalog.actions.includes(node.type)) category = 'actions';
      else if (nodeCatalog.ai.includes(node.type)) category = 'ai';
      else category = 'logic';
    }

    const posX = node.position && typeof node.position.x === 'number' ? node.position.x : 100 + index * 260;
    const posY = node.position && typeof node.position.y === 'number' ? node.position.y : 150;

    validNodes.push({
      id,
      type: node.type,
      label: node.label || node.type,
      category,
      position: { x: posX, y: posY },
      config: node.config && typeof node.config === 'object' ? node.config : {},
      status: 'idle'
    });
  });

  if (validNodes.length === 0) return null;

  const validEdges = [];
  if (Array.isArray(graph.edges)) {
    graph.edges.forEach((edge, index) => {
      const source = typeof edge.source === 'object' ? edge.source?.id : edge.source;
      const target = typeof edge.target === 'object' ? edge.target?.id : edge.target;
      if (knownIds.has(source) && knownIds.has(target)) {
        validEdges.push({
          id: edge.id || `e-${source}-${target}-${index}`,
          source,
          target,
          label: edge.label || '',
          animated: edge.animated !== false,
          condition: edge.condition || ''
        });
      }
    });
  }

  return {
    name: graph.name || 'AI Generated Workflow',
    description: graph.description || prompt,
    trigger: graph.trigger || { type: 'manual', config: {} },
    nodes: validNodes,
    edges: validEdges,
    tags: Array.isArray(graph.tags) ? graph.tags : ['ai-generated']
  };
}

async function getAiProviderKeys(owner) {
  const ownerId = String(owner?._id || owner || '');
  const user = isMemoryStore()
    ? memoryStore.findOne('users', { _id: ownerId })
    : await User.findById(ownerId).select('+geminiApiKey +openrouterApiKey').lean();

  if (!user) throw new ApiError(404, 'User not found');

  return {
    geminiApiKey: decrypt(user.geminiApiKey || ''),
    openrouterApiKey: decrypt(user.openrouterApiKey || '')
  };
}

async function generateWithOpenRouter(prompt, apiKey) {
  if (!apiKey) return null;
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: env.openRouterModel || 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: `You are an AI workflow architect. Return ONLY a valid JSON object describing a workflow graph with keys: name, description, trigger ({ type, config }), nodes (array of { id, type, label, category, position: { x, y }, config }), edges (array of { id, source, target, animated }). Available types: triggers: ${nodeCatalog.triggers.join(', ')}; actions: ${nodeCatalog.actions.join(', ')}; ai: ${nodeCatalog.ai.join(', ')}; logic: ${nodeCatalog.logic.join(', ')}.`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000
      }
    );
    const content = response.data?.choices?.[0]?.message?.content;
    return extractJson(content);
  } catch (_err) {
    return null;
  }
}

async function generateWithGemini(prompt, apiKey) {
  if (!apiKey) return null;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: env.geminiModel || 'gemini-1.5-flash' });
    const promptText = `You are an AI workflow architect. Return ONLY a valid JSON object describing a workflow graph with keys: name, description, trigger ({ type, config }), nodes (array of { id, type, label, category, position: { x, y }, config }), edges (array of { id, source, target, animated }). Available types: triggers: ${nodeCatalog.triggers.join(', ')}; actions: ${nodeCatalog.actions.join(', ')}; ai: ${nodeCatalog.ai.join(', ')}; logic: ${nodeCatalog.logic.join(', ')}. User request: ${prompt}`;
    const result = await model.generateContent(promptText);
    const text = result.response.text();
    return extractJson(text);
  } catch (_err) {
    return null;
  }
}

async function generateWorkflow(prompt, owner) {
  const keys = await getAiProviderKeys(owner);
  if (!keys.openrouterApiKey && !keys.geminiApiKey) {
    throw new ApiError(400, 'Provide a Gemini or OpenRouter API key in Settings before generating workflows.', {
      code: 'MISSING_API_KEY'
    });
  }

  let graph = await generateWithOpenRouter(prompt, keys.openrouterApiKey);
  if (!hasUsableNodes(graph)) {
    graph = await generateWithGemini(prompt, keys.geminiApiKey);
  }
  if (hasUsableNodes(graph)) {
    const sanitized = sanitizeGeneratedWorkflow(graph, prompt);
    if (sanitized) return sanitized;
  }
  if (isEmailAutomationPrompt(prompt)) {
    return buildEmailWorkflow(prompt);
  }
  return buildFallbackWorkflow(prompt);
}

async function runAiTask(prompt, owner) {
  const keys = await getAiProviderKeys(owner);
  if (!keys.openrouterApiKey && !keys.geminiApiKey) {
    throw new ApiError(400, 'Provide a Gemini or OpenRouter API key in Settings before running AI nodes.', {
      code: 'MISSING_API_KEY'
    });
  }

  if (keys.openrouterApiKey) {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: env.openRouterModel || 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
      },
      {
        headers: { Authorization: `Bearer ${keys.openrouterApiKey}` },
        timeout: 25000
      }
    );
    return response.data?.choices?.[0]?.message?.content || '';
  }

  const genAI = new GoogleGenerativeAI(keys.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: env.geminiModel || 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { generateWorkflow, getAiProviderKeys, runAiTask, nodeCatalog };
