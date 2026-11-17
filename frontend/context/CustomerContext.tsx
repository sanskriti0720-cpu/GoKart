'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { customerApi, CustomerApiError } from '@/services/customer';
import type { CartData, Customer } from '@/types/customer';

type CustomerContextValue = {
  user: Customer | null;
  cart: CartData;
  wishlistIds: string[];
  loading: boolean;
  toast: string;
  login: (values: { email: string; password: string }) => Promise<void>;
  register: (values: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number, variantSku?: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  notify: (message: string) => void;
};

const emptyCart: CartData = { items: [], itemCount: 0, subtotal: 0 };
const CustomerContext = createContext<CustomerContextValue | null>(null);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Customer | null>(null);
  const [cart, setCart] = useState(emptyCart);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const notify = useCallback((message: string) => setToast(message), []);

  const refreshUser = useCallback(async () => {
    const result = await customerApi.me();
    setUser(result.user);
  }, []);

  const refreshCart = useCallback(async () => {
    const result = await customerApi.cart();
    setCart(result.cart);
  }, []);

  useEffect(() => {
    let active = true;
    customerApi.me()
      .then((result) => { if (active) setUser(result.user); })
      .catch((error: unknown) => {
        if (active && error instanceof CustomerApiError && error.status !== 401) setToast(error.message);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([customerApi.cart(), customerApi.wishlist()])
      .then(([cartResult, wishlistResult]) => {
        if (!active) return;
        setCart(cartResult.cart);
        setWishlistIds(wishlistResult.products.map((product) => product._id));
      })
      .catch((error: unknown) => { if (active) setToast(error instanceof Error ? error.message : 'Could not load your shopping list.'); });
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const login = useCallback(async (values: { email: string; password: string }) => {
    const result = await customerApi.login(values);
    setUser(result.user);
  }, []);

  const register = useCallback(async (values: { name: string; email: string; password: string }) => {
    const result = await customerApi.register(values);
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    await customerApi.logout();
    setUser(null);
    setCart(emptyCart);
    setWishlistIds([]);
  }, []);

  const addToCart = useCallback(async (productId: string, quantity = 1, variantSku = '') => {
    if (!user) throw new CustomerApiError('Sign in to add items to your cart.', 401);
    const result = await customerApi.addCartItem(productId, quantity, variantSku);
    setCart(result.cart);
    setToast('Added to your cart.');
  }, [user]);

  const updateCartItem = useCallback(async (itemId: string, quantity: number) => {
    const result = await customerApi.updateCartItem(itemId, quantity);
    setCart(result.cart);
  }, []);

  const removeCartItem = useCallback(async (itemId: string) => {
    const result = await customerApi.removeCartItem(itemId);
    setCart(result.cart);
    setToast('Item removed from your cart.');
  }, []);

  const toggleWishlist = useCallback(async (productId: string) => {
    if (!user) throw new CustomerApiError('Sign in to save items to your wishlist.', 401);
    const exists = wishlistIds.includes(productId);
    const result = exists ? await customerApi.removeWishlist(productId) : await customerApi.addWishlist(productId);
    setWishlistIds(result.products.map((product) => product._id));
    setToast(exists ? 'Removed from your wishlist.' : 'Saved to your wishlist.');
  }, [user, wishlistIds]);

  const value = useMemo(() => ({
    user, cart, wishlistIds, loading, toast, login, register, logout, refreshUser,
    refreshCart, addToCart, updateCartItem, removeCartItem, toggleWishlist, notify,
  }), [user, cart, wishlistIds, loading, toast, login, register, logout, refreshUser, refreshCart, addToCart, updateCartItem, removeCartItem, toggleWishlist, notify]);

  return (
    <CustomerContext.Provider value={value}>
      {children}
      {toast && <div aria-live="polite" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1e2321] px-5 py-3 text-sm font-medium text-white shadow-xl">{toast}</div>}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const value = useContext(CustomerContext);
  if (!value) throw new Error('useCustomer must be used inside CustomerProvider.');
  return value;
}
