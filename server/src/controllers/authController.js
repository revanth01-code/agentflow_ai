const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
  // TODO: Register the account through authService and respond with 201 { user, token }.
  res.status(501).json({ message: 'Register is not implemented yet' });
});

const login = asyncHandler(async (req, res) => {
  // TODO: Authenticate through authService and respond with { user, token }.
  res.status(501).json({ message: 'Login is not implemented yet' });
});

const me = asyncHandler(async (req, res) => {
  // TODO: Respond with the user attached by the auth middleware.
  res.status(501).json({ message: 'Current user lookup is not implemented yet' });
});

module.exports = { register, login, me };
