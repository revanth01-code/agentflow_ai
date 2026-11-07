const axios = require('axios');
const integrationService = require('../services/integrationService');
const gmail = require('../integrations/gmail');
const googleSheets = require('../integrations/googleSheets');
const slack = require('../integrations/slack');
const discord = require('../integrations/discord');
const { isMemoryStore } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const User = require('../models/User');

function ownerId(workflow) {
  // TODO: Return the workflow owner id as a string.
  return '';
}

async function ownerEmail(workflow) {
  // TODO: Return the owner's email from the populated workflow, the memory store, or MongoDB.
  return '';
}

function configValue(config, keys, fallback) {
  // TODO: Return the first non-empty value among the given config keys, or the fallback.
  return fallback;
}

function isPlaceholderEmail(value) {
  // TODO: Return true for example.com placeholder recipients.
  return false;
}

function template(value, context) {
  // TODO: Replace the {{ input.x }}, {{ previous.x }}, and {{ outputs.x }} placeholders
  // TODO: with values from the execution context.
  return value;
}

function completed(node, data) {
  // TODO: Return the standard completed node output envelope.
  return { nodeId: node.id, type: node.type, status: 'completed', data };
}

async function runRealAction({ node, workflow, context }) {
  // TODO: Skip disabled nodes, then implement the real provider calls per node type:
  // TODO: gmail-trigger, send-email, send-slack-message, google-sheets-row,
  // TODO: send-discord-message, and http-request. Return null for every other type.
  return null;
}

async function executionAgent({ node, workflow, context }) {
  // TODO: Try the real provider action first, and otherwise return the simulated
  // TODO: completed output for the node.
  throw new Error('Execution agent is not implemented yet');
}

module.exports = executionAgent;
