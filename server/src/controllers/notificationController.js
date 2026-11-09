const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../services/notificationService');

const list = asyncHandler(async (req, res) => {
  const data = await notificationService.listNotifications(req.user);
  res.status(200).json(data);
});

module.exports = { list };
