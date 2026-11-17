const AppError = require('../utils/AppError');

function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new AppError('Online payment is not configured. Choose Cash on Delivery or try again later.', 503);
  return { keyId, keySecret };
}

async function razorpayRequest(path, method, body) {
  const { keyId, keySecret } = getCredentials();
  let response;
  try {
    response = await fetch(`https://api.razorpay.com/v1${path}`, {
      method,
      signal: AbortSignal.timeout(12000),
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new AppError('The payment service could not be reached. Please try again.', 502);
  }
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const providerMessage = result?.error?.description;
    throw new AppError(providerMessage || 'The payment service could not create or verify the payment.', response.status >= 500 ? 502 : 400);
  }
  return result;
}

function createProviderOrder({ amount, currency, receipt, notes }) {
  return razorpayRequest('/orders', 'POST', { amount, currency, receipt, notes });
}

function fetchProviderPayment(paymentId) {
  return razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`, 'GET');
}

module.exports = { createProviderOrder, fetchProviderPayment, getCredentials };
