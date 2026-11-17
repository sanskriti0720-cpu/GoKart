const express = require('express');
const {
  getProductBySlug,
  getProducts,
  getRelatedProducts,
} = require('../controllers/catalogController');
const { getProductReviews: readProductReviews } = require('../controllers/customerController');
const { validateRequest } = require('../middleware/validateRequest');
const { productListQuerySchema, slugParamSchema } = require('../validators/catalogSchemas');

const router = express.Router();

router.get('/', validateRequest(productListQuerySchema, 'query'), getProducts);
router.get('/:slug/related', validateRequest(slugParamSchema, 'params'), getRelatedProducts);
router.get('/:slug/reviews', validateRequest(slugParamSchema, 'params'), readProductReviews);
router.get('/:slug', validateRequest(slugParamSchema, 'params'), getProductBySlug);

module.exports = router;
