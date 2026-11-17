'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Sparkles, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/catalog';
import { formatPrice } from '@/utils/format';

export function HomeHero({ products }: { products: Product[] }) {
  const reduceMotion = useReducedMotion();
  const heroProduct = products[0];
  const sideProduct = products[1];

  return (
    <section className="relative overflow-hidden bg-paper">
      <div aria-hidden="true" className="pointer-events-none absolute -left-44 top-12 size-[32rem] rounded-full bg-violet/[.06] blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-20 size-[32rem] rounded-full bg-coral/[.08] blur-3xl" />
      <div className="mx-auto grid min-h-[660px] max-w-[1440px] gap-10 px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[.95fr_1.05fr] lg:items-center lg:gap-12 lg:px-12 lg:py-16">
        <motion.div animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-[630px]" initial={reduceMotion ? false : { opacity: 0, y: 22 }} transition={{ duration: .65, ease: 'easeOut' }}>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet/15 bg-white/80 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[.17em] text-violet shadow-sm sm:text-[11px]"><Sparkles size={14} /> A better kind of find</div>
          <h1 className="gk-display max-w-[720px] text-[clamp(3.2rem,8vw,6.8rem)] text-ink">Shopping, but make it <span className="relative inline-block text-violet">extraordinary<span aria-hidden="true" className="absolute -bottom-2 left-1 h-2 w-[88%] -rotate-2 rounded-full bg-lime" /></span><span className="text-coral">.</span></h1>
          <p className="mt-7 max-w-[480px] text-[15px] leading-7 text-ink/65 sm:text-[17px] sm:leading-8">Discover products you’ll love. Explore new trends, exclusive finds and everyday essentials.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link className="gk-button inline-flex items-center gap-3 rounded-full bg-violet px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(121,87,255,.22)]" href="/products">Shop now <ArrowUpRight size={17} /></Link>
            <Link className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-ink/25" href="#collections">Explore collections <ArrowDown size={15} /></Link>
          </div>
          <div className="mt-10 flex items-center gap-4 border-t border-ink/10 pt-5 text-xs text-ink/55">
            <div className="flex -space-x-2" aria-hidden="true"><span className="grid size-8 place-items-center rounded-full border-2 border-paper bg-lime text-[10px] font-black text-ink">GK</span><span className="grid size-8 place-items-center rounded-full border-2 border-paper bg-coral text-[10px] font-black text-white">♡</span><span className="grid size-8 place-items-center rounded-full border-2 border-paper bg-violet text-[10px] font-black text-white">✦</span></div>
            <span><strong className="text-ink">Your next favorite</strong><br />is closer than you think.</span>
          </div>
        </motion.div>

        <motion.div animate={{ opacity: 1, scale: 1 }} className="relative mx-auto w-full max-w-[660px]" initial={reduceMotion ? false : { opacity: 0, scale: .96 }} transition={{ duration: .8, delay: .12, ease: 'easeOut' }}>
          <div className="relative aspect-[.92] overflow-hidden rounded-[2rem] bg-ink shadow-[0_32px_90px_rgba(17,24,39,.2)] sm:aspect-[1.08] sm:rounded-[2.5rem] lg:aspect-[.95]">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_73%_24%,#a491ff_0,transparent_31%),radial-gradient(circle_at_17%_90%,#ff6b6b88_0,transparent_34%),linear-gradient(145deg,#22223d,#111827_62%)]" />
            <div aria-hidden="true" className="absolute -right-[18%] top-[5%] aspect-square w-[72%] rounded-full border border-white/15" />
            <div aria-hidden="true" className="absolute -right-[8%] top-[15%] aspect-square w-[54%] rounded-full border border-white/10" />
            <div aria-hidden="true" className="absolute left-[9%] top-[12%] size-3 rounded-full bg-lime shadow-[0_0_20px_#c7f464]" />
            <div aria-hidden="true" className="absolute bottom-[12%] right-[9%] size-2 rounded-full bg-coral shadow-[0_0_20px_#ff6b6b]" />
            {heroProduct?.images[0] && <div className="absolute inset-[8%_8%_7%_12%] overflow-hidden rounded-[1.6rem] bg-white/5">
              <Image alt={heroProduct.images[0].alt || heroProduct.name} className="object-cover opacity-[.93] mix-blend-lighten" fill priority sizes="(max-width: 768px) 90vw, 48vw" src={heroProduct.images[0].url} />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/10" />
              <div className="absolute bottom-6 left-6 right-6 text-white sm:bottom-8 sm:left-8">
                <p className="text-[9px] font-bold uppercase tracking-[.2em] text-lime">The GoKart edit</p>
                <p className="mt-2 max-w-xs text-xl font-bold leading-tight tracking-[-.04em] sm:text-2xl">{heroProduct.name}</p>
                <p className="mt-2 text-sm font-semibold">{formatPrice(heroProduct.price)}</p>
              </div>
            </div>}
            <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[.16em] text-white backdrop-blur-lg sm:left-7 sm:top-7 sm:text-[10px]">Find something unexpected</div>
          </div>

          {heroProduct && <motion.div animate={reduceMotion ? undefined : { y: [0, -9, 0], rotate: [-2, 0, -2] }} className="absolute -left-2 top-[18%] z-10 hidden max-w-[195px] rounded-2xl border border-white/70 bg-white/90 p-3.5 shadow-[0_20px_50px_rgba(17,24,39,.16)] backdrop-blur-xl sm:block" transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-xl bg-lime/65 text-violet"><Star className="fill-violet" size={15} /></span><span className="text-[9px] font-bold uppercase tracking-[.15em] text-ink/50">Good taste, confirmed</span></div>
            <p className="mt-3 line-clamp-1 text-xs font-bold text-ink">{heroProduct.ratingCount ? `${heroProduct.ratingAverage.toFixed(1)} · ${heroProduct.ratingCount} reviews` : 'A fresh find, just for you'}</p>
          </motion.div>}
          {sideProduct?.images[0] && <motion.div animate={reduceMotion ? undefined : { y: [0, 8, 0], rotate: [2, 0, 2] }} className="absolute -bottom-4 -right-2 z-10 hidden w-48 rounded-2xl border border-white/80 bg-white p-2.5 shadow-[0_22px_55px_rgba(17,24,39,.18)] sm:block" transition={{ duration: 6.3, repeat: Infinity, ease: 'easeInOut', delay: .4 }}>
            <div className="relative aspect-[1.55] overflow-hidden rounded-xl bg-paper"><Image alt={sideProduct.images[0].alt || sideProduct.name} className="object-cover" fill sizes="190px" src={sideProduct.images[0].url} /></div>
            <p className="mt-2 truncate text-[11px] font-bold text-ink">{sideProduct.name}</p>
            <p className="mt-1 text-[10px] font-semibold text-violet">{formatPrice(sideProduct.price)} <span className="ml-1 text-ink/35">· little upgrade energy</span></p>
          </motion.div>}
          <div aria-hidden="true" className="absolute -bottom-8 left-[14%] -z-10 size-20 rounded-full bg-lime/80 blur-[1px]" />
        </motion.div>
      </div>
    </section>
  );
}
