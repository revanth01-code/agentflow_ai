function errorHandler(error, _req, res, _next) {
  // TODO: Include error.details in the response payload.
  res.status(error.statusCode || 500).json({ message: error.message || 'Unexpected server error' });
}

module.exports = errorHandler;
