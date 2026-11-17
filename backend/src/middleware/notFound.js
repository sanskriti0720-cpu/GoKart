const AppError = require('../utils/AppError');

function notFound(request, _response, next) {
  next(new AppError(`Route not found: ${request.method} ${request.originalUrl}`, 404));
}

module.exports = { notFound };
