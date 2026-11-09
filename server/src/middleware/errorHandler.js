function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const payload = {
    message: error.message || 'Unexpected server error'
  };
  if (error.details) {
    payload.details = error.details;
  }
  res.status(statusCode).json(payload);
}

module.exports = errorHandler;
