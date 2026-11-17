const crypto = require('node:crypto');
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { createProviderOrder, fetchProviderPayment, getCredentials } = require('./razorpayService');

const freeShippingThreshold = 3000;
const standardShipping = 99;

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function priceFor(product, variantSku) {
  if (!variantSku) {
    if (product.variants.length) throw new AppError(`Choose an option for ${product.name}.`, 409);
    return { price: product.price, stock: product.stock, variant: undefined };
  }
  const selected = product.variants.find((variant) => variant.sku === variantSku);
  if (!selected) throw new AppError(`The selected option for ${product.name} is unavailable.`, 409);
  return {
    price: selected.price ?? product.price,
    stock: selected.stock,
    variant: { name: selected.name, value: selected.value },
  };
}

async function reserveProductStock(session, product, variantSku, quantity) {
  const filter = { _id: product._id, status: 'active', stock: { $gte: quantity } };
  const increment = { stock: -quantity, soldCount: quantity };
  if (variantSku) {
    filter.variants = { $elemMatch: { sku: variantSku, stock: { $gte: quantity } } };
    increment['variants.$.stock'] = -quantity;
  }
  const result = await Product.updateOne(filter, { $inc: increment }, { session });
  if (!result.modifiedCount) throw new AppError(`${product.name} no longer has enough stock. Review your cart and try again.`, 409);
}

async function restoreOrderStock(session, order) {
  if (!order.inventoryDeducted) return;
  for (const item of order.items) {
    const increment = { stock: item.quantity, soldCount: -item.quantity };
    const filter = { _id: item.product };
    if (item.variantSku) {
      filter.variants = { $elemMatch: { sku: item.variantSku } };
      increment['variants.$.stock'] = item.quantity;
    }
    await Product.updateOne(filter, { $inc: increment }, { session });
  }
  order.inventoryDeducted = false;
}

async function createLocalCheckout({ userId, address, paymentMethod }) {
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ user: userId }).session(session);
      if (!cart || !cart.items.length) throw new AppError('Your cart is empty.', 400);

      const orderItems = [];
      let subtotal = 0;
      let discount = 0;
      for (const item of cart.items) {
        const product = await Product.findOne({ _id: item.product, status: 'active' }).session(session);
        if (!product) throw new AppError('A product in your cart is no longer available.', 409);
        const { price, stock, variant } = priceFor(product, item.variantSku);
        if (item.quantity > stock) throw new AppError(`${product.name} does not have enough stock.`, 409);
        await reserveProductStock(session, product, item.variantSku, item.quantity);
        const lineTotal = roundCurrency(price * item.quantity);
        subtotal = roundCurrency(subtotal + lineTotal);
        discount = roundCurrency(discount + Math.max(0, (product.compareAtPrice || product.price) - price) * item.quantity);
        orderItems.push({
          product: product._id,
          name: product.name,
          slug: product.slug,
          image: product.images[0]?.url || '',
          sku: item.variantSku || product.sku,
          variantSku: item.variantSku,
          variant,
          quantity: item.quantity,
          unitPrice: price,
          lineTotal,
        });
      }

      const shipping = subtotal >= freeShippingThreshold ? 0 : standardShipping;
      const total = roundCurrency(subtotal + shipping);
      const orderNumber = `SS-${new Date().toISOString().slice(2, 10).replaceAll('-', '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      [order] = await Order.create([{
        orderNumber,
        user: userId,
        items: orderItems,
        shippingAddress: address,
        subtotal,
        shipping,
        discount,
        total,
        paymentMethod,
        paymentStatus: 'pending',
        status: 'processing',
        inventoryDeducted: true,
      }], { session });
      cart.items = [];
      await cart.save({ session });
    });
  } finally {
    await session.endSession();
  }
  return order;
}

async function restoreFailedCheckout(orderId, userId) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({ _id: orderId, user: userId }).session(session);
      if (!order || order.paymentStatus === 'paid' || order.status === 'cancelled') return;
      await restoreOrderStock(session, order);
      order.status = 'cancelled';
      order.paymentStatus = 'failed';
      await order.save({ session });
      const cart = await Cart.findOne({ user: userId }).session(session);
      if (cart) {
        for (const item of order.items) cart.items.push({ product: item.product, variantSku: item.variantSku || '', quantity: item.quantity });
        await cart.save({ session });
      }
    });
  } finally {
    await session.endSession();
  }
}

async function openRazorpayOrder(order) {
  getCredentials();
  const result = await createProviderOrder({
    amount: Math.round(order.total * 100),
    currency: 'INR',
    receipt: order.orderNumber,
    notes: { shopSphereOrderId: order._id.toString() },
  });
  order.razorpayOrderId = result.id;
  await order.save();
  return { keyId: process.env.RAZORPAY_KEY_ID, amount: result.amount, currency: result.currency, razorpayOrderId: result.id };
}

function verifySignature(orderId, paymentId, signature, secret = process.env.RAZORPAY_KEY_SECRET) {
  if (!secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest();
  let actual;
  try { actual = Buffer.from(signature, 'hex'); } catch { return false; }
  return actual.length === expected.length && crypto.timingSafeEqual(expected, actual);
}

function paymentIntentFor(order) {
  getCredentials();
  return {
    keyId: process.env.RAZORPAY_KEY_ID,
    amount: Math.round(order.total * 100),
    currency: 'INR',
    razorpayOrderId: order.razorpayOrderId,
  };
}

module.exports = {
  createLocalCheckout,
  freeShippingThreshold,
  openRazorpayOrder,
  paymentIntentFor,
  restoreFailedCheckout,
  restoreOrderStock,
  standardShipping,
  verifySignature,
};
