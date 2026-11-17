const express = require('express');
const {
  addCartItem, clearCart, getCart, removeCartItem, updateCartItem,
} = require('../controllers/customerController');
const { requireAuth } = require('../middleware/requireAuth');
const { validateRequest } = require('../middleware/validateRequest');
const {
  cartItemIdSchema, cartItemSchema, itemQuantitySchema,
} = require('../validators/customerSchemas');

const router = express.Router();
router.use(requireAuth);
router.get('/', getCart);
router.post('/items', validateRequest(cartItemSchema), addCartItem);
router.patch('/items/:itemId', validateRequest(cartItemIdSchema, 'params'), validateRequest(itemQuantitySchema), updateCartItem);
router.delete('/items/:itemId', validateRequest(cartItemIdSchema, 'params'), removeCartItem);
router.delete('/', clearCart);

module.exports = router;
