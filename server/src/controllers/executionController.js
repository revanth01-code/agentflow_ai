const asyncHandler = require('../utils/asyncHandler');
const executionService = require('../services/executionService');

const list = asyncHandler(async (req, res) => {
  const data = await executionService.listExecutions(req.query.workflowId);
  res.status(200).json(data);
});

const get = asyncHandler(async (req, res) => {
  const data = await executionService.getExecution(req.params.id);
  res.status(200).json(data);
});

const timeline = asyncHandler(async (req, res) => {
  const data = await executionService.executionTimeline(req.params.id);
  res.status(200).json(data);
});

const pause = asyncHandler(async (req, res) => {
  const data = await executionService.pauseExecution(req.params.id);
  res.status(200).json(data);
});

const resume = asyncHandler(async (req, res) => {
  const data = await executionService.resumeExecution(req.params.id, req.body?.input);
  res.status(200).json(data);
});

const cancel = asyncHandler(async (req, res) => {
  const data = await executionService.cancelExecution(req.params.id);
  res.status(200).json(data);
});

module.exports = { list, get, timeline, pause, resume, cancel };
