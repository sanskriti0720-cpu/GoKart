const { z } = require('zod');

const passwordSchema = z
  .string()
  .min(8, 'Password must contain at least 8 characters.')
  .refine((password) => Buffer.byteLength(password, 'utf8') <= 72, 'Password must be no longer than 72 bytes.');

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: passwordSchema,
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(1).max(72),
});

module.exports = { loginSchema, registerSchema };
