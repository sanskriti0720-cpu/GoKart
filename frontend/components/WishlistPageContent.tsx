'use client';

import { ArrowRight, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ProductCard } from '@/components/ProductCard';
import { customerApi } from '@/services/customer';
import type { Product } from '@/types/catalog';
import { useCustomer } from '@/context/CustomerContext';

export function WishlistPageContent() {
  const { user, addToCart, toggleWishlist, notify } = useCustomer();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');

  useEffect(() => {
    if (!user) return;
    customerApi.wishlist().then((result) => setProducts(result.products)).catch((error: unknown) => notify(error instanceof Error ? error.message : 'Could not load your wishlist.')).finally(() => setLoading(false));
  }, [user, notify]);

  async function remove(product: Product) {
    setBusy(product._id);
    try { await toggleWishlist(product._id); setProducts((current) => current.filter((entry) => entry._id !== product._id)); }
    catch (error) { notify(error instanceof Error ? error.message : 'Could not update your wishlist.'); }
    finally { setBusy(''); }
  }

  async function addCart(product: Product) {
    if (product.variants.some((variant) => variant.sku)) {
      router.push(`/products/${product.slug}`);
      return;
    }
    setBusy(product._id);
    try { await addToCart(product._id); }
    catch (error) { notify(error instanceof Error ? error.message : 'Could not add to your cart.'); }
    finally { setBusy(''); }
  }

  return <ProtectedRoute><section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b1674e]">Saved for later</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your wishlist</h1>
    {loading ? <div aria-label="Loading wishlist" className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div className="aspect-[4/5] animate-pulse rounded-2xl bg-[#eeeae3]" key={item} />)}</div> : products.length === 0 ? <div className="mt-8 rounded-3xl border border-[#ebe8e2] bg-white px-6 py-16 text-center"><Heart className="mx-auto text-[#cb7758]" size={26} /><p className="mt-4 text-lg font-medium">Nothing saved just yet.</p><p className="mt-2 text-sm text-[#717a74]">Tap the heart on anything you would like to keep close.</p><Link className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1e2321] px-6 py-3 text-sm font-semibold text-white" href="/products">Explore the collection <ArrowRight size={16} /></Link></div> : <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">{products.map((product) => <article key={product._id}><ProductCard product={product} /><div className="mt-3 flex items-center justify-between gap-2"><button className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#45504a] hover:text-[#c65f42] disabled:opacity-50" disabled={busy === product._id || !product.stock} onClick={() => addCart(product)} type="button"><ShoppingBag size={14} /> Add to bag</button><button aria-label={`Remove ${product.name}`} className="grid size-8 place-items-center rounded-full text-[#858d87] hover:bg-[#f8f5f0] hover:text-red-700" disabled={busy === product._id} onClick={() => remove(product)} type="button"><Trash2 size={15} /></button></div></article>)}</div>}
  </section></ProtectedRoute>;
}
