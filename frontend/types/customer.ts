import type { Product } from '@/types/catalog';

export type Address = {
  _id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export type Customer = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  addresses: Address[];
};

export type CartEntry = {
  _id: string;
  product: Product;
  variantSku: string;
  variant: { name: string; value: string } | null;
  availableStock: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type CartData = { items: CartEntry[]; itemCount: number; subtotal: number };

export type CustomerOrder = {
  _id: string;
  orderNumber: string;
  items: Array<{ product: string; name: string; slug: string; image: string; quantity: number; unitPrice: number; lineTotal: number }>;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'razorpay' | 'cod';
  createdAt: string;
};

export type ProductReview = {
  _id: string;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  user: { _id: string; name: string };
};
