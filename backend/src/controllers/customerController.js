const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');
const User = require('../models/User');
const Wishlist = require('../models/Wishlist');
const AppError = require('../utils/AppError');

function itemPrice(product, variantSku) {
  if (!variantSku) {
    if (product.variants.length > 0) throw new AppError('Choose a product option before adding it to your cart.', 400);
    return { price: product.price, stock: product.stock, variant: null };
  }
  const variant = product.variants.find((entry) => entry.sku === variantSku);
  if (!variant) throw new AppError('That product option is no longer available.', 400);
  return {
    price: variant.price ?? product.price,
    stock: variant.stock,
    variant: { name: variant.name, value: variant.value },
  };
}

async function readCart(userId) {
  const cart = await Cart.findOne({ user: userId }).populate('items.product', 'name slug sku price compareAtPrice stock images status variants').lean();
  const items = (cart?.items || []).filter((item) => item.product).map((item) => {
    const { price, variant, stock } = itemPrice(item.product, item.variantSku);
    return {
      _id: item._id,
      product: item.product,
      variantSku: item.variantSku,
      variant,
      availableStock: stock,
      quantity: item.quantity,
      unitPrice: price,
      lineTotal: price * item.quantity,
    };
  });
  return {
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.lineTotal, 0),
  };
}

async function getCart(request, response) {
  response.status(200).json({ cart: await readCart(request.user._id) });
}

async function addCartItem(request, response) {
  const { productId, quantity, variantSku } = request.validated.body;
  const product = await Product.findOne({ _id: productId, status: 'active' });
  if (!product) throw new AppError('Product is unavailable.', 404);
  const { stock } = itemPrice(product, variantSku);
  let cart = await Cart.findOne({ user: request.user._id });
  if (!cart) cart = new Cart({ user: request.user._id, items: [] });
  const existing = cart.items.find((item) => item.product.equals(product._id) && item.variantSku === variantSku);
  const nextQuantity = (existing?.quantity || 0) + quantity;
  if (nextQuantity > stock) throw new AppError('Requested quantity exceeds available stock.', 409);
  if (existing) existing.quantity = nextQuantity;
  else cart.items.push({ product: product._id, quantity, variantSku });
  await cart.save();
  response.status(200).json({ cart: await readCart(request.user._id) });
}

async function updateCartItem(request, response) {
  const cart = await Cart.findOne({ user: request.user._id });
  const item = cart?.items.id(request.validated.params.itemId);
  if (!item) throw new AppError('Cart item not found.', 404);
  const product = await Product.findOne({ _id: item.product, status: 'active' });
  if (!product) throw new AppError('Product is unavailable.', 404);
  if (request.validated.body.quantity > itemPrice(product, item.variantSku).stock) {
    throw new AppError('Requested quantity exceeds available stock.', 409);
  }
  item.quantity = request.validated.body.quantity;
  await cart.save();
  response.status(200).json({ cart: await readCart(request.user._id) });
}

async function removeCartItem(request, response) {
  const cart = await Cart.findOne({ user: request.user._id });
  if (!cart || !cart.items.id(request.validated.params.itemId)) throw new AppError('Cart item not found.', 404);
  cart.items.pull({ _id: request.validated.params.itemId });
  await cart.save();
  response.status(200).json({ cart: await readCart(request.user._id) });
}

async function clearCart(request, response) {
  await Cart.findOneAndUpdate({ user: request.user._id }, { $set: { items: [] } }, { upsert: true });
  response.status(200).json({ cart: await readCart(request.user._id) });
}

async function getWishlist(request, response) {
  const wishlist = await Wishlist.findOne({ user: request.user._id }).populate({
    path: 'products', select: 'name slug sku price compareAtPrice stock images ratingAverage ratingCount status', match: { status: 'active' },
  }).lean();
  response.status(200).json({ products: (wishlist?.products || []).filter(Boolean) });
}

async function addWishlistItem(request, response) {
  const product = await Product.findOne({ _id: request.validated.body.productId, status: 'active' }).select('_id');
  if (!product) throw new AppError('Product is unavailable.', 404);
  await Wishlist.updateOne({ user: request.user._id }, { $addToSet: { products: product._id } }, { upsert: true });
  await getWishlist(request, response);
}

async function removeWishlistItem(request, response) {
  await Wishlist.updateOne({ user: request.user._id }, { $pull: { products: request.validated.params.productId } });
  await getWishlist(request, response);
}

async function getProfile(request, response) {
  const user = await User.findById(request.user._id);
  response.status(200).json({ user });
}

async function updateProfile(request, response) {
  const user = await User.findByIdAndUpdate(request.user._id, { $set: request.validated.body }, { new: true, runValidators: true });
  response.status(200).json({ user });
}

async function addAddress(request, response) {
  const user = await User.findById(request.user._id);
  const address = request.validated.body;
  if (address.isDefault || user.addresses.length === 0) user.addresses.forEach((entry) => { entry.isDefault = false; });
  user.addresses.push({ ...address, isDefault: address.isDefault || user.addresses.length === 0 });
  await user.save();
  response.status(201).json({ user });
}

async function updateAddress(request, response) {
  const user = await User.findById(request.user._id);
  const address = user.addresses.id(request.validated.params.addressId);
  if (!address) throw new AppError('Address not found.', 404);
  const update = request.validated.body;
  if (update.isDefault) user.addresses.forEach((entry) => { entry.isDefault = false; });
  Object.assign(address, update);
  await user.save();
  response.status(200).json({ user });
}

async function removeAddress(request, response) {
  const user = await User.findById(request.user._id);
  const address = user.addresses.id(request.validated.params.addressId);
  if (!address) throw new AppError('Address not found.', 404);
  const wasDefault = address.isDefault;
  user.addresses.pull({ _id: address._id });
  if (wasDefault && user.addresses.length) user.addresses[0].isDefault = true;
  await user.save();
  response.status(200).json({ user });
}

async function getOrders(request, response) {
  const orders = await Order.find({ user: request.user._id }).sort({ createdAt: -1 }).lean();
  response.status(200).json({ orders });
}

async function getOrder(request, response) {
  const order = await Order.findOne({ _id: request.validated.params.orderId, user: request.user._id }).lean();
  if (!order) throw new AppError('Order not found.', 404);
  response.status(200).json({ order });
}

async function getProductReviews(request, response) {
  const product = await Product.findOne({ slug: request.validated.params.slug, status: 'active' }).select('_id');
  if (!product) throw new AppError('Product not found.', 404);
  const reviews = await Review.find({ product: product._id }).populate('user', 'name').sort({ createdAt: -1 }).lean();
  response.status(200).json({ reviews });
}

async function createReview(request, response) {
  const product = await Product.findOne({ _id: request.validated.params.productId, status: 'active' });
  if (!product) throw new AppError('Product not found.', 404);
  const purchase = await Order.exists({
    user: request.user._id,
    'items.product': product._id,
    $or: [{ status: 'delivered' }, { paymentStatus: 'paid' }],
  });
  if (!purchase) throw new AppError('A completed purchase is required to review this product.', 403);
  const review = await Review.create({ ...request.validated.body, product: product._id, user: request.user._id, isVerifiedPurchase: true });
  const aggregate = await Review.aggregate([
    { $match: { product: product._id } },
    { $group: { _id: '$product', average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Product.updateOne({ _id: product._id }, { $set: { ratingAverage: aggregate[0]?.average || 0, ratingCount: aggregate[0]?.count || 0 } });
  response.status(201).json({ review: await Review.findById(review._id).populate('user', 'name').lean() });
}

module.exports = {
  addAddress, addCartItem, addWishlistItem, clearCart, createReview, getCart,
  getOrder, getOrders, getProductReviews, getProfile, getWishlist, removeAddress,
  removeCartItem, removeWishlistItem, updateAddress, updateCartItem, updateProfile,
};
