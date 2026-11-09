const asyncHandler = require('../utils/asyncHandler');
const workflowService = require('../services/workflowService');
const executionService = require('../services/executionService');

const list = asyncHandler(async (req, res) => {
  const data = await workflowService.listWorkflows(req.user);
  res.status(200).json(data);
});

const create = asyncHandler(async (req, res) => {
  const data = await workflowService.createWorkflow(req.body, req.user);
  res.status(201).json(data);
});

const get = asyncHandler(async (req, res) => {
  const data = await workflowService.getWorkflow(req.params.id, req.user);
  res.status(200).json(data);
});

const update = asyncHandler(async (req, res) => {
  const data = await workflowService.updateWorkflow(req.params.id, req.user, req.body);
  res.status(200).json(data);
});

const duplicate = asyncHandler(async (req, res) => {
  const data = await workflowService.duplicateWorkflow(req.params.id, req.user);
  res.status(201).json(data);
});

const remove = asyncHandler(async (req, res) => {
  await workflowService.deleteWorkflow(req.params.id, req.user);
  res.status(204).send();
});

const generate = asyncHandler(async (req, res) => {
  const data = await workflowService.generateWorkflowFromPrompt(req.body.prompt, req.user);
  res.status(201).json(data);
});

const execute = asyncHandler(async (req, res) => {
  const workflow = await workflowService.getWorkflow(req.params.id, req.user);
  const data = await executionService.executeWorkflow(workflow, req.body.input || {});
  res.status(202).json(data);
});

const dashboard = asyncHandler(async (req, res) => {
  const data = await workflowService.dashboardStats(req.user);
  res.status(200).json(data);
});

module.exports = { list, create, get, update, duplicate, remove, generate, execute, dashboard };
