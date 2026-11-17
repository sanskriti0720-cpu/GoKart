const express = require('express');
const { getCategories, getCategoryBySlug } = require('../controllers/catalogController');
const { validateRequest } = require('../middleware/validateRequest');
const { slugParamSchema } = require('../validators/catalogSchemas');

const router = express.Router();

router.get('/', getCategories);
router.get('/:slug', validateRequest(slugParamSchema, 'params'), getCategoryBySlug);

module.exports = router;
