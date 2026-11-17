'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import type { Category, ProductQuery } from '@/types/catalog';

function FilterFields({ categories, query, mobile = false, onApply }: { categories: Category[]; query: ProductQuery; mobile?: boolean; onApply?: () => void }) {
  return <form action="/products" className={mobile ? 'space-y-5' : 'space-y-5'} onSubmit={onApply}>
    <div>
      <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[.17em] text-ink/45">Search collection</p>
      <input className="w-full rounded-xl border border-line bg-paper/70 px-3 py-3 text-sm outline-none transition focus:border-violet focus:bg-white" defaultValue={query.q} name="q" placeholder="Product or keyword" />
    </div>
    <div>
      <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[.17em] text-ink/45">Shop a category</p>
      <select className="w-full rounded-xl border border-line bg-white px-3 py-3 text-sm outline-none transition focus:border-violet" defaultValue={query.category || ''} name="category"><option value="">All collections</option>{categories.map((category) => <option key={category._id} value={category.slug}>{category.name}</option>)}</select>
    </div>
    <div>
      <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[.17em] text-ink/45">Price range</p>
      <div className="grid grid-cols-2 gap-2"><label className="rounded-xl border border-line px-3 py-2"><span className="block text-[9px] font-semibold uppercase text-ink/35">Min · ₹</span><input className="mt-1 w-full bg-transparent text-sm outline-none" defaultValue={query.minPrice} min="0" name="minPrice" placeholder="0" type="number" /></label><label className="rounded-xl border border-line px-3 py-2"><span className="block text-[9px] font-semibold uppercase text-ink/35">Max · ₹</span><input className="mt-1 w-full bg-transparent text-sm outline-none" defaultValue={query.maxPrice} min="0" name="maxPrice" placeholder="Any" type="number" /></label></div>
    </div>
    <div>
      <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[.17em] text-ink/45">Brand</p>
      <input className="w-full rounded-xl border border-line bg-paper/70 px-3 py-3 text-sm outline-none transition focus:border-violet focus:bg-white" defaultValue={query.brand} maxLength={80} name="brand" placeholder="Any brand" />
    </div>
    <div>
      <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[.17em] text-ink/45">Customer rating</p>
      <select className="w-full rounded-xl border border-line bg-white px-3 py-3 text-sm outline-none transition focus:border-violet" defaultValue={query.minRating || ''} name="minRating"><option value="">Any rating</option><option value="3">3 stars & up</option><option value="4">4 stars & up</option><option value="4.5">4.5 stars & up</option></select>
    </div>
    <div>
      <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[.17em] text-ink/45">Sort your way</p>
      <select className="w-full rounded-xl border border-line bg-white px-3 py-3 text-sm outline-none transition focus:border-violet" defaultValue={query.sort || 'newest'} name="sort"><option value="newest">Just landed</option><option value="popular">Most loved</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select>
    </div>
    <button className="gk-button flex w-full items-center justify-center gap-2 rounded-full bg-violet px-4 py-3 text-xs font-bold text-white" type="submit"><Check size={15} /> Show me the finds</button>
  </form>;
}

export function ProductFilters({ categories, query }: { categories: Category[]; query: ProductQuery }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return <>
    <button aria-expanded={mobileOpen} className="mb-4 flex w-full items-center justify-between rounded-2xl border border-line bg-white px-4 py-3 text-sm font-bold text-ink lg:hidden" onClick={() => setMobileOpen((open) => !open)} type="button"><span className="inline-flex items-center gap-2"><SlidersHorizontal className="text-violet" size={17} /> Filters & sort</span>{mobileOpen ? <X size={17} /> : <ChevronDown size={17} />}</button>
    <aside className="hidden rounded-[1.5rem] border border-ink/[.07] bg-white p-5 shadow-[0_12px_32px_rgba(17,24,39,.04)] lg:block">
      <div className="mb-5 flex items-center justify-between"><h2 className="text-sm font-extrabold tracking-[-.02em]">Find your fit</h2><SlidersHorizontal className="text-violet" size={16} /></div>
      <FilterFields categories={categories} query={query} />
    </aside>
    <AnimatePresence>
      {mobileOpen && <motion.div animate={{ opacity: 1 }} className="fixed inset-0 z-[60] bg-ink/55 p-3 backdrop-blur-sm lg:hidden" exit={{ opacity: 0 }} initial={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileOpen(false); }}>
        <motion.section animate={{ y: 0 }} aria-label="Product filters" aria-modal="true" className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[1.7rem] bg-white p-5 pb-8" exit={{ y: '100%' }} initial={{ y: '100%' }} role="dialog" transition={{ type: 'spring', damping: 28, stiffness: 280 }}>
          <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-black tracking-[-.04em]">Your kind of find.</h2><button aria-label="Close filters" className="grid size-9 place-items-center rounded-full bg-paper" onClick={() => setMobileOpen(false)} type="button"><X size={17} /></button></div>
          <FilterFields categories={categories} mobile onApply={() => setMobileOpen(false)} query={query} />
        </motion.section>
      </motion.div>}
    </AnimatePresence>
  </>;
}
