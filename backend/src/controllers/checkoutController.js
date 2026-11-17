const crypto = require('node:crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const {
  createLocalCheckout,
  openRazorpayOrder,
  paymentIntentFor,
  restoreFailedCheckout,
  restoreOrderStock,
  verifySignature,
} = require('../services/checkoutService');
const { fetchProviderPayment, getCredentials } = require('../services/razorpayService');

function toOrderAddress(address) {
  return {
    name: address.name,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 || '',
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
  };
}

async function createCheckout(request, response) {
  const { addressId, paymentMethod } = request.validated.body;
  if (paymentMethod === 'razorpay') getCredentials();
  const address = request.user.addresses.id(addressId);
  if (!address) throw new AppError('Choose a saved shipping address before checkout.', 400);
  const order = await createLocalCheckout({ userId: request.user._id, address: toOrderAddress(address), paymentMethod });
  if (paymentMethod === 'cod') {
    response.status(201).json({ order });
    return;
  }

  try {
    const payment = await openRazorpayOrder(order);
    response.status(201).json({ order, payment });
  } catch (error) {
    await restoreFailedCheckout(order._id, request.user._id);
    throw error;
  }
}

async function retryPayment(request, response) {
  const order = await Order.findOne({ _id: request.validated.params.orderId, user: request.user._id });
  if (!order) throw new AppError('Order not found.', 404);
  if (order.paymentMethod !== 'razorpay' || order.status !== 'processing' || order.paymentStatus === 'paid' || !order.inventoryDeducted) {
    throw new AppError('This order is not eligible for an online payment retry.', 409);
  }
  const payment = order.razorpayOrderId ? paymentIntentFor(order) : await openRazorpayOrder(order);
  response.status(200).json({ order, payment });
}

async function verifyPayment(request, response) {
  const { razorpay_order_id: providerOrderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = request.validated.body;
  const order = await Order.findOne({ _id: request.validated.params.orderId, user: request.user._id });
  if (!order) throw new AppError('Order not found.', 404);
  if (order.paymentMethod !== 'razorpay' || order.status === 'cancelled') throw new AppError('This order cannot accept an online payment.', 409);
  if (order.paymentStatus === 'paid') {
    if (order.razorpayPaymentId === paymentId) { response.status(200).json({ order }); return; }
    throw new AppError('This order already has a confirmed payment.', 409);
  }
  if (!order.razorpayOrderId || order.razorpayOrderId !== providerOrderId) throw new AppError('The payment does not match this order.', 400);
  if (!verifySignature(order.razorpayOrderId, paymentId, signature)) throw new AppError('Payment signature verification failed.', 400);

  const payment = await fetchProviderPayment(paymentId);
  if (payment.order_id !== order.razorpayOrderId || payment.amount !== Math.round(order.total * 100) || payment.currency !== 'INR') {
    throw new AppError('The payment amount or order reference does not match.', 400);
  }
  if (payment.status !== 'captured' || payment.captured !== true) {
    throw new AppError('Payment has not been captured yet. Please wait a moment or retry.', 409);
  }

  const updated = await Order.findOneAndUpdate(
    { _id: order._id, user: request.user._id, razorpayOrderId: providerOrderId, paymentStatus: { $ne: 'paid' }, status: { $ne: 'cancelled' } },
    { $set: { paymentStatus: 'paid', razorpayPaymentId: paymentId } },
    { new: true },
  );
  if (!updated) {
    const current = await Order.findOne({ _id: order._id, user: request.user._id });
    if (current?.paymentStatus === 'paid' && current.razorpayPaymentId === paymentId) { response.status(200).json({ order: current }); return; }
    throw new AppError('The order changed while confirming payment. Contact support before retrying.', 409);
  }
  response.status(200).json({ order: updated });
}

async function cancelOrder(request, response) {
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      order = await Order.findOne({ _id: request.validated.params.orderId, user: request.user._id }).session(session);
      if (!order) throw new AppError('Order not found.', 404);
      if (order.status !== 'processing' || order.paymentStatus === 'paid') {
        throw new AppError('This order can no longer be cancelled online.', 409);
      }
      if (order.paymentMethod === 'razorpay') {
        throw new AppError('Online-payment orders cannot be cancelled while a payment attempt may still complete.', 409);
      }
      await restoreOrderStock(session, order);
      order.status = 'cancelled';
      await order.save({ session });
    });
  } finally {
    await session.endSession();
  }
  response.status(200).json({ order });
}

function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest();
  const actual = Buffer.from(signature, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(expected, actual);
}

async function handleRazorpayWebhook(request, response) {
  const signature = request.get('x-razorpay-signature');
  if (!Buffer.isBuffer(request.body) || !verifyWebhookSignature(request.body, signature)) {
    throw new AppError('Webhook signature verification failed.', 401);
  }
  const event = JSON.parse(request.body.toString('utf8'));
  if (event.event === 'payment.captured') {
    const payment = event.payload?.payment?.entity;
    if (payment?.order_id && payment?.id && payment.currency === 'INR') {
      const matchingOrder = await Order.findOne({
        razorpayOrderId: payment.order_id,
        paymentMethod: 'razorpay',
        status: { $ne: 'cancelled' },
        total: payment.amount / 100,
      }).select('_id');
      if (matchingOrder) await Order.updateOne(
        { _id: matchingOrder._id, paymentStatus: { $ne: 'paid' } },
        { $set: { paymentStatus: 'paid', razorpayPaymentId: payment.id } },
      );
    }
  }
  response.status(200).json({ received: true });
}

module.exports = { cancelOrder, createCheckout, handleRazorpayWebhook, retryPayment, verifyPayment };
