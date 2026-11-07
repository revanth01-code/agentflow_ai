const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

const nodeCatalog = {
  triggers: ['gmail-trigger', 'webhook-trigger', 'schedule-trigger', 'manual-trigger', 'slack-trigger'],
  actions: ['send-email', 'send-slack-message', 'send-discord-message', 'google-sheets-row', 'http-request', 'database-insert'],
  ai: ['ai-classification', 'ai-extraction', 'ai-summarization', 'ai-decision', 'ai-validation', 'dynamic-routing'],
  logic: ['if-else', 'retry', 'delay', 'approval', 'parallel-execution']
};

function extractEmail(prompt) {
  // TODO: Return the first email address found in the prompt.
  return '';
}

function extractQuotedText(prompt, fallback) {
  // TODO: Return the last quoted phrase in the prompt, or the fallback.
  return fallback;
}

function extractSubject(prompt) {
  // TODO: Return the quoted subject from the prompt, defaulting to 'Automation Test'.
  return 'Automation Test';
}

function isEmailAutomationPrompt(prompt) {
  // TODO: Return true when the prompt asks for an email send action.
  return false;
}

function buildEmailWorkflow(prompt) {
  // TODO: Build the manual-trigger to send-email graph using the recipient, subject,
  // TODO: and body extracted from the prompt.
  return { name: '', description: prompt, trigger: { type: 'manual' }, nodes: [], edges: [], tags: [] };
}

function buildFallbackWorkflow(prompt) {
  // TODO: Build the deterministic offline graph: pick the trigger, AI extraction, the
  // TODO: notification channel (email / Slack / Discord), the optional Google Sheets row,
  // TODO: the decision node, and the approval escalation, then wire the edges.
  return { name: 'AI Generated Workflow', description: prompt, trigger: { type: 'manual' }, nodes: [], edges: [] };
}

function hasUsableNodes(graph) {
  // TODO: Return true when the graph has at least one node with an id and a type.
  return false;
}

function sanitizeGeneratedWorkflow(graph, prompt) {
  // TODO: Validate the model output, normalize every node (id, type, label, category,
  // TODO: position, config), merge email defaults for email prompts, keep only edges
  // TODO: between known nodes, and return the persisted workflow shape.
  return null;
}

function extractJson(text) {
  // TODO: Pull the first JSON object out of the model response and parse it.
  return null;
}

async function generateWithOpenRouter(prompt) {
  // TODO: Call the OpenRouter chat completions API with the node catalog system prompt
  // TODO: and return the parsed JSON graph, or null when no API key is configured.
  return null;
}

async function generateWithGemini(prompt) {
  // TODO: Call the Gemini model and return the parsed JSON graph, or null when no key is set.
  return null;
}

async function generateWorkflow(prompt) {
  // TODO: Try OpenRouter, then Gemini, sanitize the result, and fall back to the
  // TODO: deterministic offline graph when the AI providers fail or return nothing usable.
  throw new Error('Workflow generation is not implemented yet');
}

module.exports = { generateWorkflow, nodeCatalog };
