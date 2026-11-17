const express = require('express');
const { createReview } = require('../controllers/customerController');
const { requireAuth } = require('../middleware/requireAuth');
const { validateRequest } = require('../middleware/validateRequest');
const { reviewProductIdSchema, reviewSchema } = require('../validators/customerSchemas');

const router = express.Router();
router.post('/:productId', requireAuth, validateRequest(reviewProductIdSchema, 'params'), validateRequest(reviewSchema), createReview);

module.exports = router;
