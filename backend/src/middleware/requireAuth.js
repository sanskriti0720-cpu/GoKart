const User = require('../models/User');
const AppError = require('../utils/AppError');
const { verifyAuthToken } = require('../utils/authToken');

async function requireAuth(request, _response, next) {
  const token = request.cookies?.shopsphere_token;
  if (!token) {
    return next(new AppError('Authentication is required.', 401));
  }

  let payload;
  try {
    payload = verifyAuthToken(token);
  } catch (error) {
    return next(new AppError('Authentication is required.', 401));
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    return next(new AppError('Your session is no longer valid.', 401));
  }

  request.user = user;
  return next();
}

function requireAdmin(request, _response, next) {
  if (!request.user || request.user.role !== 'admin') {
    return next(new AppError('Administrator access is required.', 403));
  }
  return next();
}

module.exports = { requireAdmin, requireAuth };
