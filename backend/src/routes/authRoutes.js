const express = require('express');
const { getCurrentUser, login, logout, register } = require('../controllers/authController');
const { authRateLimit } = require('../middleware/authRateLimit');
const { requireAuth } = require('../middleware/requireAuth');
const { validateRequest } = require('../middleware/validateRequest');
const { loginSchema, registerSchema } = require('../validators/authSchemas');

const router = express.Router();

router.post('/register', authRateLimit, validateRequest(registerSchema), register);
router.post('/login', authRateLimit, validateRequest(loginSchema), login);
router.post('/logout', logout);
router.get('/me', requireAuth, getCurrentUser);

module.exports = router;
