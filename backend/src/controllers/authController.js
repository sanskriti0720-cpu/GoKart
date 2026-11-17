const User = require('../models/User');
const AppError = require('../utils/AppError');
const { getAuthCookieOptions, signAuthToken } = require('../utils/authToken');

function setAuthCookie(response, user) {
  response.cookie('shopsphere_token', signAuthToken(user._id), getAuthCookieOptions());
}

async function register(request, response) {
  const { name, email, password } = request.validated.body;
  const existingUser = await User.exists({ email });
  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const user = await User.create({ name, email, password });
  setAuthCookie(response, user);
  response.status(201).json({ user });
}

async function login(request, response) {
  const { email, password } = request.validated.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.isActive || !(await user.comparePassword(password))) {
    throw new AppError('Email or password is incorrect.', 401);
  }

  setAuthCookie(response, user);
  response.status(200).json({ user });
}

function logout(_request, response) {
  response.clearCookie('shopsphere_token', getAuthCookieOptions());
  response.status(204).end();
}

function getCurrentUser(request, response) {
  response.status(200).json({ user: request.user });
}

module.exports = { getCurrentUser, login, logout, register };
