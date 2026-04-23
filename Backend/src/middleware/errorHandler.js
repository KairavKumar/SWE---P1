function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const code = err.code || "INTERNAL_ERROR";

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    error: {
      code,
      message: err.message || "Unexpected error"
    }
  });
}

module.exports = errorHandler;
