const AppError = require('../utils/AppError');

function validateRequest(schema, source = 'body') {
  return (request, _response, next) => {
    const result = schema.safeParse(request[source]);
    if (!result.success) {
      return next(new AppError('Request validation failed.', 400, result.error.flatten()));
    }

    request.validated = request.validated || {};
    request.validated[source] = result.data;
    return next();
  };
}

module.exports = { validateRequest };
