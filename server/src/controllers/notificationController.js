const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../services/notificationService');

const list = asyncHandler(async (req, res) => {
  // TODO: Respond with the notifications for the current user.
  res.status(501).json({ message: 'List notifications is not implemented yet' });
});

module.exports = { list };
