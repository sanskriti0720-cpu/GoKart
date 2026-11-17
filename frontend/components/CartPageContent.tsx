'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useCustomer } from '@/context/CustomerContext';
import { formatPrice } from '@/utils/format';

export function CartPageContent() {
  const { cart, updateCartItem, removeCartItem, notify } = useCustomer();
  const [busy, setBusy] = useState('');
  const shipping = cart.items.length === 0 || cart.subtotal >= 3000 ? 0 : 99;

  async function update(action: () => Promise<void>, id: string) {
    setBusy(id);
    try { await action(); }
    catch (error) { notify(error instanceof Error ? error.message : 'Could not update your cart.'); }
    finally { setBusy(''); }
  }

  return <ProtectedRoute><section className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 sm:py-14">
    <div className="mb-8"><p className="text-[10px] font-black uppercase tracking-[.2em] text-violet">Your GoKart edit</p><h1 className="mt-2 text-4xl font-black tracking-[-.065em] sm:text-5xl">Shopping bag<span className="ml-3 align-middle text-base font-semibold tracking-normal text-ink/40">{cart.itemCount} items</span></h1><p className="mt-3 max-w-xl text-sm leading-6 text-ink/55">Good finds deserve a good home. Review your picks and get them on their way.</p></div>
    {cart.items.length === 0 ? <div className="rounded-[2rem] border border-line bg-white px-6 py-16 text-center shadow-soft"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-violet/10 text-violet"><ShoppingBag size={24} /></span><h2 className="mt-5 text-xl font-black">Your bag is taking a little breather.</h2><p className="mt-2 text-sm text-ink/55">Find something useful, beautiful, or both.</p><Link className="gk-button mt-6 inline-flex rounded-full bg-violet px-6 py-3 text-sm font-bold text-white" href="/products">Explore the collection</Link></div> : <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-3">{cart.items.map((item) => <article className="flex gap-4 rounded-3xl border border-line bg-white p-4 sm:gap-5 sm:p-5" key={item._id}>
        <Link className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-paper sm:size-32" href={`/products/${item.product.slug}`}>{item.product.images[0] && <Image alt={item.product.images[0].alt || item.product.name} className="object-cover transition duration-500 hover:scale-105" fill sizes="128px" src={item.product.images[0].url} />}</Link>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[.18em] text-violet">{item.product.brand || 'GoKart find'}</p><Link className="mt-1 block truncate text-sm font-bold text-ink transition hover:text-violet sm:text-base" href={`/products/${item.product.slug}`}>{item.product.name}</Link>{item.variant && <p className="mt-1 text-xs text-ink/50">{item.variant.name}: {item.variant.value}</p>}<p className="mt-2 text-sm font-black">{formatPrice(item.unitPrice)}</p></div>
          <div className="flex items-center justify-between gap-3 sm:justify-end"><div className="inline-flex items-center rounded-full border border-line bg-paper/60"><button aria-label="Decrease quantity" className="grid size-9 place-items-center rounded-full transition hover:text-violet disabled:opacity-40" disabled={busy === item._id || item.quantity <= 1} onClick={() => update(() => updateCartItem(item._id, item.quantity - 1), item._id)} type="button"><Minus size={14} /></button><span className="min-w-7 text-center text-xs font-bold">{item.quantity}</span><button aria-label="Increase quantity" className="grid size-9 place-items-center rounded-full transition hover:text-violet disabled:opacity-40" disabled={busy === item._id || item.quantity >= Math.min(item.availableStock, 99)} onClick={() => update(() => updateCartItem(item._id, item.quantity + 1), item._id)} type="button"><Plus size={14} /></button></div><p className="min-w-20 text-right text-sm font-black">{formatPrice(item.lineTotal)}</p><button aria-label={`Remove ${item.product.name}`} className="grid size-9 place-items-center rounded-full text-ink/35 transition hover:bg-coral/10 hover:text-coral disabled:opacity-40" disabled={busy === item._id} onClick={() => update(() => removeCartItem(item._id), item._id)} type="button"><Trash2 size={16} /></button></div>
        </div>
      </article>)}</div>
      <aside className="sticky top-28 rounded-[1.75rem] bg-ink p-5 text-white shadow-[0_20px_60px_rgba(17,24,39,.14)] sm:p-6"><p className="text-[9px] font-black uppercase tracking-[.2em] text-lime">A little recap</p><h2 className="mt-2 text-xl font-black">Order summary</h2><div className="mt-6 space-y-3 border-b border-white/10 pb-5 text-xs"><div className="flex justify-between text-white/60"><span>Subtotal</span><span>{formatPrice(cart.subtotal)}</span></div><div className="flex justify-between text-white/60"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>{shipping > 0 && <p className="text-[10px] text-lime">Free delivery on orders over ₹3,000.</p>}</div><div className="mt-5 flex justify-between text-base font-black"><span>Total</span><span>{formatPrice(cart.subtotal + shipping)}</span></div><Link className="gk-button mt-6 flex items-center justify-center rounded-full bg-lime px-5 py-3.5 text-sm font-black text-ink" href="/checkout">Continue to checkout</Link><Link className="mt-4 block text-center text-xs font-bold text-white/55 transition hover:text-white" href="/products">Keep exploring</Link><p className="mt-6 flex items-center justify-center gap-2 text-[9px] font-semibold text-white/45"><ShieldCheck size={13} /> Secure checkout · prices verified at checkout</p></aside>
    </div>}
  </section></ProtectedRoute>;
}
