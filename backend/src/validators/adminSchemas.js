const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i);
const imageSchema = z.object({ url: z.string().url().max(2048), publicId: z.string().max(160).optional().default(''), alt: z.string().max(160).optional().default('') });
const variantSchema = z.object({ name: z.string().trim().min(1).max(60), value: z.string().trim().min(1).max(60), sku: z.string().trim().max(80).optional().default(''), price: z.coerce.number().min(0).optional(), stock: z.coerce.number().int().min(0).default(0) });

const productSchema = z.object({
  name: z.string().trim().min(2).max(160), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  sku: z.string().trim().min(1).max(80), description: z.string().trim().min(10).max(5000),
  category: objectId, brand: z.string().trim().max(80).optional().default(''), price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).nullable().optional().default(null), stock: z.coerce.number().int().min(0),
  images: z.array(imageSchema).max(12).default([]), variants: z.array(variantSchema).max(40).default([]),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]), status: z.enum(['draft', 'active', 'archived']).default('draft'), isFeatured: z.boolean().default(false),
});

const categorySchema = z.object({ name: z.string().trim().min(2).max(60), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), description: z.string().trim().max(500).optional().default(''), image: z.union([z.literal(''), z.string().url().max(2048)]).optional().default(''), isActive: z.boolean().default(true) });
const idParamSchema = z.object({ id: objectId });
const listQuerySchema = z.object({ q: z.string().trim().max(100).optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(25) });
const orderStatusSchema = z.object({ status: z.enum(['processing', 'shipped', 'delivered']) });
const activeSchema = z.object({ isActive: z.boolean() });

module.exports = { activeSchema, categorySchema, idParamSchema, listQuerySchema, orderStatusSchema, productSchema };
