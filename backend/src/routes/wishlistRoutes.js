const express = require('express');
const {
  addWishlistItem, getWishlist, removeWishlistItem,
} = require('../controllers/customerController');
const { requireAuth } = require('../middleware/requireAuth');
const { validateRequest } = require('../middleware/validateRequest');
const { productIdSchema } = require('../validators/customerSchemas');

const router = express.Router();
router.use(requireAuth);
router.get('/', getWishlist);
router.post('/items', validateRequest(productIdSchema), addWishlistItem);
router.delete('/items/:productId', validateRequest(productIdSchema, 'params'), removeWishlistItem);

module.exports = router;
