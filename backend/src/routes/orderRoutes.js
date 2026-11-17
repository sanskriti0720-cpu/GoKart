const express = require('express');
const { getOrder, getOrders } = require('../controllers/customerController');
const { cancelOrder } = require('../controllers/checkoutController');
const { requireAuth } = require('../middleware/requireAuth');
const { validateRequest } = require('../middleware/validateRequest');
const { z } = require('zod');

const orderIdSchema = z.object({ orderId: z.string().regex(/^[a-f\d]{24}$/i) });
const router = express.Router();
router.use(requireAuth);
router.get('/', getOrders);
router.post('/:orderId/cancel', validateRequest(orderIdSchema, 'params'), cancelOrder);
router.get('/:orderId', validateRequest(orderIdSchema, 'params'), getOrder);

module.exports = router;
