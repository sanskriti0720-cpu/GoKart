const Category = require('../models/Category');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { listProducts } = require('../services/catalogService');

async function getCategories(_request, response) {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
  response.status(200).json({ categories });
}

async function getCategoryBySlug(request, response) {
  const category = await Category.findOne({ slug: request.validated.params.slug, isActive: true }).lean();
  if (!category) throw new AppError('Category not found.', 404);
  response.status(200).json({ category });
}

async function getProducts(request, response) {
  const result = await listProducts(request.validated.query);
  response.status(200).json(result);
}

async function getProductBySlug(request, response) {
  const product = await Product.findOne({ slug: request.validated.params.slug, status: 'active' })
    .populate('category', 'name slug')
    .lean();
  if (!product) throw new AppError('Product not found.', 404);
  response.status(200).json({ product });
}

async function getRelatedProducts(request, response) {
  const { slug } = request.validated.params;
  const product = await Product.findOne({ slug, status: 'active' }).select('category').lean();
  if (!product) throw new AppError('Product not found.', 404);

  const products = await Product.find({
    category: product.category,
    status: 'active',
    slug: { $ne: slug },
  })
    .sort({ soldCount: -1, createdAt: -1 })
    .limit(4)
    .populate('category', 'name slug')
    .lean();

  response.status(200).json({ products });
}

module.exports = {
  getCategories,
  getCategoryBySlug,
  getProductBySlug,
  getProducts,
  getRelatedProducts,
};
