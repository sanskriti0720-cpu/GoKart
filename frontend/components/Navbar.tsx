'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Heart, Menu, ShoppingCart, Sparkles, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BrandMark } from '@/components/BrandMark';
import { SearchBar } from '@/components/SearchBar';
import { useCustomer } from '@/context/CustomerContext';

const categories = [
  { label: 'Technology', slug: 'technology' },
  { label: 'Home & Living', slug: 'home-living' },
  { label: 'Style', slug: 'style' },
];

export function Navbar() {
  const { cart, user } = useCustomer();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 8);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  const wishlistHref = user ? '/wishlist' : '/account/sign-in';
  const cartHref = user ? '/cart' : '/account/sign-in';
  const accountHref = user ? '/account' : '/account/sign-in';

  return (
    <>
      <div className="bg-ink text-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-[.15em] sm:text-[11px]">
          <Sparkles aria-hidden="true" className="text-lime" size={13} />
          <span>Discover more. Shop better.</span>
          <span className="hidden text-white/45 sm:inline">—</span>
          <span className="hidden text-white/65 sm:inline">Free shipping over ₹3,000</span>
        </div>
      </div>
      <header className={`sticky top-0 z-40 border-b border-ink/5 bg-paper/90 backdrop-blur-xl transition-shadow duration-300 ${scrolled ? 'shadow-[0_12px_32px_rgba(17,24,39,.08)]' : ''}`}>
        <div className="mx-auto flex max-w-[1440px] items-center gap-5 px-4 py-3.5 sm:px-7 lg:px-10">
          <BrandMark />
          <nav aria-label="Main navigation" className="hidden items-center gap-6 pl-5 text-[13px] font-semibold text-ink/70 xl:flex">
            <Link className="transition hover:text-violet" href="/products">Shop</Link>
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1 transition hover:text-violet">Categories <ChevronDown className="transition group-open:rotate-180" size={14} /></summary>
              <div className="absolute left-0 top-full mt-4 w-52 rounded-2xl border border-line bg-white p-2 shadow-[0_20px_50px_rgba(17,24,39,.15)]">
                {categories.map((category) => <Link className="block rounded-xl px-3 py-2.5 text-sm transition hover:bg-violet/5 hover:text-violet" href={`/products?category=${category.slug}`} key={category.slug}>{category.label}</Link>)}
              </div>
            </details>
            <Link className="transition hover:text-violet" href="/products?sort=popular">Deals</Link>
            <Link className="transition hover:text-violet" href="/products?sort=newest">New arrivals</Link>
          </nav>
          <div className="ml-auto hidden w-full max-w-[340px] lg:block">
            <SearchBar inputId="desktop-product-search" />
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 lg:ml-0">
            <Link aria-label="Your wishlist" className="grid size-10 place-items-center rounded-full text-ink/75 transition hover:bg-violet/10 hover:text-violet" href={wishlistHref}><Heart size={19} strokeWidth={1.8} /></Link>
            <Link aria-label={`Shopping cart, ${cart.itemCount} items`} className="relative grid size-10 place-items-center rounded-full text-ink/75 transition hover:bg-violet/10 hover:text-violet" href={cartHref}>
              <ShoppingCart size={20} strokeWidth={1.8} />
              <AnimatePresence initial={false}>
                {cart.itemCount > 0 && <motion.span animate={{ opacity: 1, scale: 1, y: 0 }} className="absolute -right-0.5 -top-0.5 grid min-h-[18px] min-w-[18px] place-items-center rounded-full bg-coral px-1 text-[9px] font-bold text-white" exit={{ opacity: 0, scale: 0.5 }} initial={{ opacity: 0, scale: 0.5, y: 4 }} key={cart.itemCount}>{cart.itemCount}</motion.span>}
              </AnimatePresence>
            </Link>
            <Link aria-label={user ? 'Your account' : 'Sign in'} className="hidden h-10 items-center gap-2 rounded-full border border-ink/10 bg-white px-3 text-[12px] font-semibold transition hover:border-violet/40 hover:text-violet sm:flex" href={accountHref}>
              <UserRound size={16} strokeWidth={1.8} />{user ? user.name.split(' ')[0] : <span>Sign in</span>}
            </Link>
          {user?.role === 'admin' && <Link className="hidden h-10 items-center rounded-full bg-ink px-3 text-[11px] font-bold text-white transition hover:bg-violet xl:flex" href="/admin">Admin</Link>}
            <button aria-expanded={menuOpen} aria-label={menuOpen ? 'Close menu' : 'Open menu'} className="grid size-10 place-items-center rounded-full border border-ink/10 text-ink xl:hidden" onClick={() => setMenuOpen((current) => !current)} type="button">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
          </div>
        </div>
        <div className="mx-auto max-w-[1440px] px-4 pb-3 sm:px-7 lg:hidden">
          <SearchBar inputId="mobile-product-search" />
        </div>
        <AnimatePresence>
          {menuOpen && <motion.nav animate={{ height: 'auto', opacity: 1 }} aria-label="Mobile navigation" className="overflow-hidden border-t border-ink/5 bg-white xl:hidden" exit={{ height: 0, opacity: 0 }} initial={{ height: 0, opacity: 0 }}>
            <div className="mx-auto grid max-w-[1440px] gap-1 px-4 py-4 sm:px-7">
              {user?.role === 'admin' && <Link className="rounded-xl bg-ink px-3 py-3 text-sm font-bold text-white" href="/admin" onClick={() => setMenuOpen(false)}>Admin workspace</Link>}
              {[['Shop all', '/products'], ['Deals', '/products?sort=popular'], ['New arrivals', '/products?sort=newest'], ['Technology', '/products?category=technology'], ['Home & Living', '/products?category=home-living'], ['Style', '/products?category=style'], [user ? 'Your account' : 'Sign in', accountHref], ['Wishlist', wishlistHref], ['Your cart', cartHref]].map(([label, href]) => <Link className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-ink/75 hover:bg-violet/5 hover:text-violet" href={href} key={label} onClick={() => setMenuOpen(false)}>{label}<span className="text-xs text-ink/35">↗</span></Link>)}
            </div>
          </motion.nav>}
        </AnimatePresence>
      </header>
    </>
  );
}
