import type { Address, CartData, Customer, CustomerOrder, ProductReview } from '@/types/customer';
import type { Product } from '@/types/catalog';

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');

export class CustomerApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'CustomerApiError';
    this.status = status;
  }
}

export type PaymentIntent = { keyId: string; amount: number; currency: string; razorpayOrderId: string };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      credentials: 'include',
      headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
    });
  } catch {
    throw new CustomerApiError('The GoKart account service is unavailable.', 503);
  }
  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new CustomerApiError(result?.error?.message || 'Your request could not be completed.', response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

const json = (method: string, body?: unknown): RequestInit => ({ method, ...(body ? { body: JSON.stringify(body) } : {}) });

export const customerApi = {
  register: (values: { name: string; email: string; password: string }) => request<{ user: Customer }>('/auth/register', json('POST', values)),
  login: (values: { email: string; password: string }) => request<{ user: Customer }>('/auth/login', json('POST', values)),
  logout: () => request<void>('/auth/logout', json('POST')),
  me: () => request<{ user: Customer }>('/auth/me'),
  cart: () => request<{ cart: CartData }>('/cart'),
  addCartItem: (productId: string, quantity = 1, variantSku = '') => request<{ cart: CartData }>('/cart/items', json('POST', { productId, quantity, variantSku })),
  updateCartItem: (itemId: string, quantity: number) => request<{ cart: CartData }>(`/cart/items/${itemId}`, json('PATCH', { quantity })),
  removeCartItem: (itemId: string) => request<{ cart: CartData }>(`/cart/items/${itemId}`, json('DELETE')),
  wishlist: () => request<{ products: Product[] }>('/wishlist'),
  addWishlist: (productId: string) => request<{ products: Product[] }>('/wishlist/items', json('POST', { productId })),
  removeWishlist: (productId: string) => request<{ products: Product[] }>(`/wishlist/items/${productId}`, json('DELETE')),
  profile: () => request<{ user: Customer }>('/users/me'),
  updateProfile: (values: { name?: string; phone?: string }) => request<{ user: Customer }>('/users/me', json('PATCH', values)),
  addAddress: (address: Omit<Address, '_id'>) => request<{ user: Customer }>('/users/me/addresses', json('POST', address)),
  updateAddress: (id: string, address: Omit<Address, '_id'>) => request<{ user: Customer }>(`/users/me/addresses/${id}`, json('PATCH', address)),
  removeAddress: (id: string) => request<{ user: Customer }>(`/users/me/addresses/${id}`, json('DELETE')),
  orders: () => request<{ orders: CustomerOrder[] }>('/orders'),
  order: (id: string) => request<{ order: CustomerOrder }>(`/orders/${id}`),
  cancelOrder: (id: string) => request<{ order: CustomerOrder }>(`/orders/${id}/cancel`, json('POST')),
  createCheckout: (addressId: string, paymentMethod: 'razorpay' | 'cod') => request<{ order: CustomerOrder; payment?: PaymentIntent }>('/checkout', json('POST', { addressId, paymentMethod })),
  retryPayment: (orderId: string) => request<{ order: CustomerOrder; payment: PaymentIntent }>(`/checkout/${orderId}/payment-intent`, json('POST')),
  verifyPayment: (orderId: string, values: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => request<{ order: CustomerOrder }>(`/checkout/${orderId}/verify-payment`, json('POST', values)),
  reviews: (slug: string) => request<{ reviews: ProductReview[] }>(`/products/${encodeURIComponent(slug)}/reviews`),
  createReview: (productId: string, values: { rating: number; title: string; body: string }) => request<{ review: ProductReview }>(`/reviews/${productId}`, json('POST', values)),
};
