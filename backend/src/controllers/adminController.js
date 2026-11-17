const Category = require('../models/Category');
const crypto = require('node:crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');
const User = require('../models/User');
const AppError = require('../utils/AppError');

function paged(query) {
  const page = query.page || 1;
  const limit = query.limit || 25;
  return { page, limit, skip: (page - 1) * limit };
}

async function getOverview(_request, response) {
  const [orderCount, paidOrders, customerCount, productCount, recentOrders, monthlyRevenue] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, revenue: { $sum: '$total' } } }]),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments({ status: { $ne: 'archived' } }),
    Order.find().sort({ createdAt: -1 }).limit(8).populate('user', 'name email').lean(),
    Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1) } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);
  response.json({ stats: { revenue: paidOrders[0]?.revenue || 0, orders: orderCount, customers: customerCount, products: productCount }, recentOrders, monthlyRevenue });
}

async function signImageUpload(_request, response) {
  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = process.env;
  if (!cloudName || !apiKey || !apiSecret) throw new AppError('Cloudinary image uploads are not configured.', 503);
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'gokart/products';
  const signature = crypto.createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`).digest('hex');
  response.json({ cloudName, apiKey, timestamp, folder, signature });
}

async function listProducts(request, response) {
  const { page, limit, skip } = paged(request.validated.query);
  const q = request.validated.query.q;
  const filter = q ? { $or: [{ name: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }, { sku: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }] } : {};
  const [products, total] = await Promise.all([Product.find(filter).populate('category', 'name slug').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), Product.countDocuments(filter)]);
  response.json({ products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}

async function createProduct(request, response) {
  const category = await Category.findById(request.validated.body.category);
  if (!category) throw new AppError('Choose an existing category.', 400);
  const product = await Product.create(request.validated.body);
  response.status(201).json({ product });
}

async function updateProduct(request, response) {
  if (!(await Category.exists({ _id: request.validated.body.category }))) throw new AppError('Choose an existing category.', 400);
  const product = await Product.findByIdAndUpdate(request.validated.params.id, { $set: request.validated.body }, { new: true, runValidators: true }).populate('category', 'name slug');
  if (!product) throw new AppError('Product not found.', 404);
  response.json({ product });
}

async function archiveProduct(request, response) {
  const product = await Product.findByIdAndUpdate(request.validated.params.id, { $set: { status: 'archived' } }, { new: true });
  if (!product) throw new AppError('Product not found.', 404);
  response.json({ product });
}

async function listCategories(_request, response) {
  response.json({ categories: await Category.find().sort({ name: 1 }).lean() });
}

async function createCategory(request, response) {
  response.status(201).json({ category: await Category.create(request.validated.body) });
}

async function updateCategory(request, response) {
  const category = await Category.findByIdAndUpdate(request.validated.params.id, { $set: request.validated.body }, { new: true, runValidators: true });
  if (!category) throw new AppError('Category not found.', 404);
  response.json({ category });
}

async function deactivateCategory(request, response) {
  const category = await Category.findByIdAndUpdate(request.validated.params.id, { $set: { isActive: false } }, { new: true });
  if (!category) throw new AppError('Category not found.', 404);
  response.json({ category });
}

async function listOrders(request, response) {
  const { page, limit, skip } = paged(request.validated.query);
  const [orders, total] = await Promise.all([Order.find().populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), Order.countDocuments()]);
  response.json({ orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}

async function updateOrderStatus(request, response) {
  const order = await Order.findById(request.validated.params.id);
  if (!order) throw new AppError('Order not found.', 404);
  const next = request.validated.body.status;
  const allowedNext = { processing: ['shipped'], shipped: ['delivered'], delivered: [], cancelled: [] };
  if (next !== order.status && !allowedNext[order.status]?.includes(next)) throw new AppError('Order status can only move forward through processing, shipped, and delivered.', 409);
  order.status = next;
  await order.save();
  response.json({ order });
}

async function listCustomers(request, response) {
  const { page, limit, skip } = paged(request.validated.query);
  const q = request.validated.query.q;
  const filter = { role: 'customer' };
  if (q) filter.$or = [{ name: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }, { email: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }];
  const [customers, total] = await Promise.all([User.find(filter).select('name email phone isActive createdAt').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), User.countDocuments(filter)]);
  response.json({ customers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}

async function updateCustomer(request, response) {
  const customer = await User.findOneAndUpdate({ _id: request.validated.params.id, role: 'customer' }, { $set: { isActive: request.validated.body.isActive } }, { new: true }).select('name email isActive');
  if (!customer) throw new AppError('Customer not found.', 404);
  response.json({ customer });
}

async function listReviews(request, response) {
  const { page, limit, skip } = paged(request.validated.query);
  const [reviews, total] = await Promise.all([Review.find().populate('user', 'name email').populate('product', 'name slug').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), Review.countDocuments()]);
  response.json({ reviews, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}

async function deleteReview(request, response) {
  const review = await Review.findByIdAndDelete(request.validated.params.id);
  if (!review) throw new AppError('Review not found.', 404);
  const [aggregate] = await Review.aggregate([{ $match: { product: review.product } }, { $group: { _id: '$product', average: { $avg: '$rating' }, count: { $sum: 1 } } }]);
  await Product.updateOne({ _id: review.product }, { $set: { ratingAverage: aggregate?.average || 0, ratingCount: aggregate?.count || 0 } });
  response.json({ success: true });
}

module.exports = { archiveProduct, createCategory, createProduct, deactivateCategory, deleteReview, getOverview, listCategories, listCustomers, listOrders, listProducts, listReviews, signImageUpload, updateCategory, updateCustomer, updateOrderStatus, updateProduct };
