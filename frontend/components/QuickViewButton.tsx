'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Eye, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RatingStars } from '@/components/RatingStars';
import { useCustomer } from '@/context/CustomerContext';
import type { Product } from '@/types/catalog';
import { formatPrice, getDiscountPercent } from '@/utils/format';
import { WishlistButton } from '@/components/WishlistButton';

export function QuickViewButton({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { addToCart, user, notify } = useCustomer();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', closeOnEscape); document.body.style.overflow = ''; };
  }, [open]);

  async function addItem() {
    if (!user) { notify('Sign in to add this find to your cart.'); router.push('/account/sign-in'); return; }
    setBusy(true);
    try { await addToCart(product._id); setOpen(false); }
    catch (error) { notify(error instanceof Error ? error.message : 'Could not add this product.'); }
    finally { setBusy(false); }
  }

  return <>
    <button aria-label={`Quick view ${product.name}`} className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-[10px] font-bold text-ink shadow-lg backdrop-blur-md transition hover:bg-lime" onClick={() => setOpen(true)} type="button"><Eye size={13} /><span>Quick view</span></button>
    <AnimatePresence>
      {open && <motion.div animate={{ opacity: 1 }} className="fixed inset-0 z-[70] grid place-items-center bg-ink/65 p-3 backdrop-blur-sm sm:p-6" exit={{ opacity: 0 }} initial={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
        <motion.section animate={{ opacity: 1, scale: 1, y: 0 }} aria-label={`Quick view: ${product.name}`} aria-modal="true" className="relative grid max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[1.75rem] bg-white shadow-2xl sm:grid-cols-2 sm:overflow-hidden" exit={{ opacity: 0, scale: .98, y: 16 }} initial={reduceMotion ? false : { opacity: 0, scale: .96, y: 18 }} role="dialog" transition={{ duration: .22 }}>
          <button aria-label="Close quick view" className="absolute right-3 top-3 z-20 grid size-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm" onClick={() => setOpen(false)} type="button"><X size={17} /></button>
          <div className="relative min-h-[240px] bg-paper sm:min-h-[430px]">
            {product.images[0] && <Image alt={product.images[0].alt || product.name} className="object-cover" fill sizes="(max-width: 640px) 100vw, 50vw" src={product.images[0].url} />}
            {getDiscountPercent(product.price, product.compareAtPrice) && <span className="absolute left-4 top-4 rounded-full bg-coral px-3 py-1.5 text-[10px] font-bold text-white">-{getDiscountPercent(product.price, product.compareAtPrice)}%</span>}
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-9">
            <p className="text-[9px] font-extrabold uppercase tracking-[.2em] text-violet">{product.brand || product.category.name}</p>
            <h2 className="mt-2 text-2xl font-bold leading-tight tracking-[-.055em] text-ink sm:text-3xl">{product.name}</h2>
            <div className="mt-3"><RatingStars count={product.ratingCount} rating={product.ratingAverage} /></div>
            <div className="mt-5 flex items-baseline gap-2"><span className="text-2xl font-black tracking-[-.04em]">{formatPrice(product.price)}</span>{product.compareAtPrice && product.compareAtPrice > product.price && <span className="text-sm text-ink/40 line-through">{formatPrice(product.compareAtPrice)}</span>}</div>
            <p className="mt-4 line-clamp-4 text-sm leading-6 text-ink/60">{product.description}</p>
            <div className="mt-5 flex items-center gap-2 text-xs font-semibold"><span className={`size-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-coral'}`} />{product.stock > 0 ? `${product.stock} available` : 'Currently sold out'}</div>
            <div className="mt-7 flex gap-2">
              {product.variants.length ? <Link className="gk-button flex flex-1 items-center justify-center gap-2 rounded-full bg-violet px-4 py-3 text-xs font-bold text-white" href={`/products/${product.slug}`}>Choose options <ArrowUpRight size={15} /></Link> : <button className="gk-button flex-1 rounded-full bg-violet px-4 py-3 text-xs font-bold text-white disabled:opacity-50" disabled={busy || product.stock < 1} onClick={addItem} type="button">{busy ? 'Adding…' : product.stock > 0 ? 'Add to cart' : 'Sold out'}</button>}
              <WishlistButton compact productId={product._id} />
            </div>
            <Link className="mt-4 text-center text-xs font-bold text-ink/50 transition hover:text-violet" href={`/products/${product.slug}`}>Full product details <ArrowUpRight className="ml-1 inline" size={12} /></Link>
          </div>
        </motion.section>
      </motion.div>}
    </AnimatePresence>
  </>;
}
