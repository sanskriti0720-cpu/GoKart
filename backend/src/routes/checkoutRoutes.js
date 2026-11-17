const express = require('express');
const { z } = require('zod');
const {
  createCheckout, retryPayment, verifyPayment,
} = require('../controllers/checkoutController');
const { requireAuth } = require('../middleware/requireAuth');
const { validateRequest } = require('../middleware/validateRequest');
const {
  checkoutSchema, paymentVerificationSchema,
} = require('../validators/customerSchemas');

const orderIdSchema = z.object({ orderId: z.string().regex(/^[a-f\d]{24}$/i) });
const router = express.Router();
router.use(requireAuth);
router.post('/', validateRequest(checkoutSchema), createCheckout);
router.post('/:orderId/payment-intent', validateRequest(orderIdSchema, 'params'), retryPayment);
router.post('/:orderId/verify-payment', validateRequest(orderIdSchema, 'params'), validateRequest(paymentVerificationSchema), verifyPayment);

module.exports = router;
