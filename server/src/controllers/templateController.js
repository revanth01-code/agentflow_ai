const asyncHandler = require('../utils/asyncHandler');
const templateService = require('../services/templateService');

const list = asyncHandler(async (_req, res) => {
  res.status(200).json(await templateService.listTemplates());
});

const use = asyncHandler(async (req, res) => {
  res.status(201).json(await templateService.useTemplate(req.params.id, req.user));
});

module.exports = { list, use };
