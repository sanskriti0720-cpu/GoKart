function errorHandler(error, _request, response, _next) {
  let statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
  let message = error.message || 'An unexpected error occurred.';
  let details = error.details;

  if (error.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyPattern || {})[0];
    message = field ? `A record with this ${field} already exists.` : 'A record with these details already exists.';
  }

  if (error.name === 'ValidationError') {
    details = Object.fromEntries(
      Object.entries(error.errors).map(([field, issue]) => [field, issue.message]),
    );
  }

  if (statusCode >= 500 && process.env.NODE_ENV === 'production') {
    message = 'An unexpected error occurred.';
    details = undefined;
  }

  response.status(statusCode).json({
    error: {
      message,
      ...(details ? { details } : {}),
    },
  });
}

module.exports = { errorHandler };
