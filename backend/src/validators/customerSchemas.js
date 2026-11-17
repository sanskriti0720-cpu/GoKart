const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'A valid record ID is required.');
const address = z.object({
  label: z.string().trim().max(40).default('Home'),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20),
  line1: z.string().trim().min(4).max(120),
  line2: z.string().trim().max(120).default(''),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(3).max(16),
  country: z.string().trim().min(2).max(80).default('India'),
  isDefault: z.boolean().default(false),
});

module.exports = {
  addressSchema: address,
  addressIdSchema: z.object({ addressId: objectId }),
  cartItemIdSchema: z.object({ itemId: objectId }),
  cartItemSchema: z.object({
    productId: objectId,
    quantity: z.coerce.number().int().min(1).max(99).default(1),
    variantSku: z.string().trim().max(80).default(''),
  }),
  checkoutSchema: z.object({
    addressId: objectId,
    paymentMethod: z.enum(['razorpay', 'cod']),
  }),
  itemQuantitySchema: z.object({ quantity: z.coerce.number().int().min(1).max(99) }),
  productIdSchema: z.object({ productId: objectId }),
  profileSchema: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    phone: z.string().trim().max(20).optional(),
  }).refine((body) => Object.keys(body).length > 0, 'At least one profile field is required.'),
  reviewSchema: z.object({
    rating: z.coerce.number().int().min(1).max(5),
    title: z.string().trim().max(100).default(''),
    body: z.string().trim().min(10).max(2000),
  }),
  reviewProductIdSchema: z.object({ productId: objectId }),
  paymentVerificationSchema: z.object({
    razorpay_order_id: z.string().trim().min(8).max(80),
    razorpay_payment_id: z.string().trim().min(8).max(80),
    razorpay_signature: z.string().regex(/^[a-f\d]{64}$/i),
  }),
};
