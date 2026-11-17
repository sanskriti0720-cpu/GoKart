const jwt = require('jsonwebtoken');
const AppError = require('./AppError');

const tokenLifetimeSeconds = 7 * 24 * 60 * 60;
const tokenIssuer = 'shopsphere-api';
const tokenAudience = 'shopsphere-web';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || secret.startsWith('replace-with-')) {
    throw new AppError('JWT_SECRET must be set to a random value of at least 32 characters.', 500);
  }
  return secret;
}

function signAuthToken(userId) {
  return jwt.sign({ sub: userId.toString() }, getJwtSecret(), {
    expiresIn: tokenLifetimeSeconds,
    issuer: tokenIssuer,
    audience: tokenAudience,
  });
}

function verifyAuthToken(token) {
  return jwt.verify(token, getJwtSecret(), {
    issuer: tokenIssuer,
    audience: tokenAudience,
  });
}

function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: tokenLifetimeSeconds * 1000,
  };
}

module.exports = { getAuthCookieOptions, signAuthToken, verifyAuthToken };
