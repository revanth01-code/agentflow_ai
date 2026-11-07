const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

function validate(req, _res, next) {
  // TODO: Read validationResult(req) and pass a 422 ApiError with the error array to next().
  next();
}

module.exports = validate;
