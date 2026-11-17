const express = require('express');
const {
  addAddress, getProfile, removeAddress, updateAddress, updateProfile,
} = require('../controllers/customerController');
const { requireAuth } = require('../middleware/requireAuth');
const { validateRequest } = require('../middleware/validateRequest');
const {
  addressIdSchema, addressSchema, profileSchema,
} = require('../validators/customerSchemas');

const router = express.Router();
router.use(requireAuth);
router.get('/me', getProfile);
router.patch('/me', validateRequest(profileSchema), updateProfile);
router.post('/me/addresses', validateRequest(addressSchema), addAddress);
router.patch('/me/addresses/:addressId', validateRequest(addressIdSchema, 'params'), validateRequest(addressSchema), updateAddress);
router.delete('/me/addresses/:addressId', validateRequest(addressIdSchema, 'params'), removeAddress);

module.exports = router;
