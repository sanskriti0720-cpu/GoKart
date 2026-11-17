import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';

export function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden bg-ink text-white">
      <div aria-hidden="true" className="absolute -right-28 -top-40 size-[26rem] rounded-full border border-white/[.07]" />
      <div aria-hidden="true" className="absolute -right-10 -top-24 size-[20rem] rounded-full border border-white/[.07]" />
      <div className="relative mx-auto grid max-w-[1440px] gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.4fr_.7fr_.7fr] lg:px-12">
        <div>
          <BrandMark inverse />
          <p className="mt-5 max-w-sm text-[15px] leading-7 text-white/60">Good things, great finds, and a little more joy in every delivery.</p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[.15em] text-white/55"><span className="size-1.5 rounded-full bg-lime" /> Discover More. Shop Better.</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/40">Explore</p>
          <div className="mt-5 grid gap-3 text-sm text-white/75">
            <Link className="transition hover:text-lime" href="/products">Shop all</Link>
            <Link className="transition hover:text-lime" href="/products?sort=newest">New arrivals</Link>
            <Link className="transition hover:text-lime" href="/products?sort=popular">Trending & deals</Link>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/40">Your GoKart</p>
          <div className="mt-5 grid gap-3 text-sm text-white/75">
            <Link className="inline-flex items-center gap-1 transition hover:text-lime" href="/account">My account <ArrowUpRight size={13} /></Link>
            <Link className="inline-flex items-center gap-1 transition hover:text-lime" href="/account/orders">Order history <ArrowUpRight size={13} /></Link>
            <Link className="inline-flex items-center gap-1 transition hover:text-lime" href="/wishlist">Saved finds <ArrowUpRight size={13} /></Link>
          </div>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 py-4 text-[10px] text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <span>© {new Date().getFullYear()} GoKart. Make room for better finds.</span>
          <span>Designed for the curious.</span>
        </div>
      </div>
    </footer>
  );
}
