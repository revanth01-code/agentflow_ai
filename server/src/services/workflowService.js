const { isMemoryStore } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const Workflow = require('../models/Workflow');
const ApiError = require('../utils/apiError');
const { generateWorkflow } = require('./aiService');

function normalizeEdges(edges = [], nodes = []) {
  // TODO: Give every edge an id, resolve string/object source and target values, default
  // TODO: animated to true, and drop edges that do not connect two known nodes.
  return [];
}

function normalizeWorkflow(payload, owner) {
  // TODO: Build the persisted shape (name, description, owner, status, trigger, nodes,
  // TODO: normalized edges, tags), keeping only nodes that have an id.
  return {};
}

async function createWorkflow(payload, owner) {
  // TODO: Normalize the payload and insert it into the memory store or MongoDB.
  throw new ApiError(501, 'Create workflow service is not implemented yet');
}

async function listWorkflows(owner) {
  // TODO: Return the owner's workflows sorted by updatedAt descending.
  throw new ApiError(501, 'List workflows service is not implemented yet');
}

async function getWorkflow(id, owner) {
  // TODO: Find the workflow by id and owner, throwing a 404 when it does not exist.
  throw new ApiError(501, 'Get workflow service is not implemented yet');
}

async function updateWorkflow(id, owner, payload) {
  // TODO: Verify ownership, normalize the payload, and save the updated workflow.
  throw new ApiError(501, 'Update workflow service is not implemented yet');
}

async function duplicateWorkflow(id, owner) {
  // TODO: Copy the workflow as a new draft named "<name> Copy" with version 1.
  throw new ApiError(501, 'Duplicate workflow service is not implemented yet');
}

async function deleteWorkflow(id, owner) {
  // TODO: Verify ownership and delete the workflow.
  throw new ApiError(501, 'Delete workflow service is not implemented yet');
}

async function generateWorkflowFromPrompt(prompt, owner) {
  // TODO: Build the graph with the AI service and persist it as a new workflow.
  throw new ApiError(501, 'Workflow generation service is not implemented yet');
}

async function dashboardStats(owner) {
  // TODO: Aggregate the workflow totals, recent executions, notifications, and the
  // TODO: completed / failed / running analytics for the dashboard.
  throw new ApiError(501, 'Dashboard statistics service is not implemented yet');
}

module.exports = {
  createWorkflow,
  listWorkflows,
  getWorkflow,
  updateWorkflow,
  duplicateWorkflow,
  deleteWorkflow,
  generateWorkflowFromPrompt,
  dashboardStats
};
