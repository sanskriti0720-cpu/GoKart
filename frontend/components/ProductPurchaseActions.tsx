'use client';

import { ArrowRight, ShoppingCart, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Product } from '@/types/catalog';
import { useCustomer } from '@/context/CustomerContext';
import { WishlistButton } from '@/components/WishlistButton';

export function ProductPurchaseActions({ product }: { product: Product }) {
  const { addToCart, user } = useCustomer();
  const router = useRouter();
  const [variantSku, setVariantSku] = useState(product.variants.find((variant) => variant.stock > 0)?.sku || '');
  const [busy, setBusy] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [error, setError] = useState('');
  const selectedVariant = product.variants.find((variant) => variant.sku === variantSku);
  const available = selectedVariant ? selectedVariant.stock : product.stock;
  const needsChoice = product.variants.some((variant) => variant.sku);

  async function addItem(goToCheckout = false) {
    if (!available || (needsChoice && !variantSku)) return;
    if (!user) { router.push('/account/sign-in'); return; }
    setBusy(true);
    setBuyingNow(goToCheckout);
    setError('');
    try {
      await addToCart(product._id, 1, variantSku);
      if (goToCheckout) router.push('/checkout');
    } catch (issue) {
      if (issue instanceof Error && issue.message.startsWith('Sign in')) router.push('/account/sign-in');
      else setError(issue instanceof Error ? issue.message : 'Could not add this item.');
    } finally { setBusy(false); setBuyingNow(false); }
  }

  return (
    <div className="mt-7">
      {needsChoice && <div className="mb-5"><label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[.16em] text-ink/55" htmlFor="product-option">Choose {product.variants[0]?.name || 'an option'}</label><select className="w-full max-w-sm rounded-2xl border border-line bg-white px-4 py-3.5 text-sm outline-none transition focus:border-violet focus:shadow-[0_0_0_4px_rgba(121,87,255,.08)]" id="product-option" onChange={(event) => setVariantSku(event.target.value)} value={variantSku}><option value="">Select an option</option>{product.variants.map((variant) => <option disabled={variant.stock < 1} key={variant.sku} value={variant.sku}>{variant.name}: {variant.value}{variant.stock < 1 ? ' — sold out' : ''}</option>)}</select>{selectedVariant?.price !== undefined && <p className="mt-2 text-xs text-ink/55">Selected price: <span className="font-bold text-ink">₹{selectedVariant.price.toLocaleString('en-IN')}</span></p>}</div>}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button className="gk-button inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-violet px-5 py-4 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(121,87,255,.2)] transition disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || !available || (needsChoice && !variantSku)} onClick={() => addItem(false)} type="button"><ShoppingCart size={17} />{busy && !buyingNow ? 'Adding…' : available ? 'Add to cart' : 'Out of stock'}</button>
        <button className="gk-button inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-ink/10 bg-white px-5 py-4 text-sm font-bold text-ink transition hover:border-violet/30 hover:text-violet disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || !available || (needsChoice && !variantSku)} onClick={() => addItem(true)} type="button"><Zap className="text-coral" size={16} />{busy && buyingNow ? 'Taking you there…' : 'Buy now'} <ArrowRight size={14} /></button>
        <WishlistButton productId={product._id} />
      </div>
      {error && <p className="mt-3 rounded-xl bg-coral/5 px-3 py-2 text-sm text-[#b23c48]" role="alert">{error}</p>}
      {!available && <p className="mt-3 text-xs font-medium text-coral">This item is currently unavailable.</p>}
    </div>
  );
}
