import type { Metadata } from 'next';
import { ArrowRight, BadgeCheck, Box, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { CategoryCard } from '@/components/CategoryCard';
import { HomeHero } from '@/components/HomeHero';
import { ProductGrid } from '@/components/ProductGrid';
import { SectionHeading } from '@/components/SectionHeading';
import { getCategories, getProducts } from '@/services/catalog';

export const metadata: Metadata = {
  title: 'GoKart — Discover More. Shop Better.',
  description: 'Find your next favorite at GoKart. Discover trends, exclusive finds and everyday essentials.',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categoriesResult, popularResult, newestResult] = await Promise.allSettled([
    getCategories(),
    getProducts({ sort: 'popular', limit: '8' }),
    getProducts({ sort: 'newest', limit: '4' }),
  ]);

  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
  const trending = popularResult.status === 'fulfilled' ? popularResult.value.products : [];
  const newArrivals = newestResult.status === 'fulfilled' ? newestResult.value.products : [];
  const allLoadedProducts = [...trending, ...newArrivals];
  const categoryCards = categories.map((category) => ({
    ...category,
    image: category.image || allLoadedProducts.find((product) => product.category?.slug === category.slug)?.images[0]?.url || '',
  }));
  const editorPick = trending.find((product) => product.isFeatured) || trending[0];
  const catalogUnavailable = categoriesResult.status === 'rejected'
    && popularResult.status === 'rejected'
    && newestResult.status === 'rejected';

  return (
    <div className="overflow-hidden bg-paper text-ink">
      <HomeHero products={trending.slice(0, 2)} />

      <div className="border-y border-ink/[.07] bg-white/70">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 divide-y divide-ink/[.07] px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8 lg:px-12">
          <div className="flex items-center justify-center gap-3 py-4 text-xs font-semibold text-ink/65 sm:py-5"><Box className="text-violet" size={17} /> Free shipping over ₹3,000</div>
          <div className="flex items-center justify-center gap-3 py-4 text-xs font-semibold text-ink/65 sm:py-5"><BadgeCheck className="text-violet" size={17} /> Secure checkout, always</div>
          <div className="flex items-center justify-center gap-3 py-4 text-xs font-semibold text-ink/65 sm:py-5"><Sparkles className="text-coral" size={17} /> Finds worth keeping</div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {catalogUnavailable && <div role="status" className="my-10 rounded-2xl border border-coral/20 bg-white px-5 py-4 text-sm text-ink/65">Our collection is taking a moment to load. Please check back shortly.</div>}

        {categoryCards.length > 0 && <section className="py-16 sm:py-20" id="collections">
          <SectionHeading eyebrow="Find your kind of thing" title="Browse by mood." href="/products" linkLabel="All collections" />
          <div className="grid gap-4 sm:grid-cols-3">{categoryCards.map((category, index) => <CategoryCard category={category} index={index} key={category._id} />)}</div>
        </section>}

        {trending.length > 0 && <section className="pb-16 sm:pb-20">
          <SectionHeading eyebrow="The ones everyone loves" title="Trending right now." href="/products?sort=popular" linkLabel="See what’s hot" />
          <ProductGrid products={trending.slice(0, 4)} />
        </section>}

        {editorPick && <section className="pb-16 sm:pb-20">
          <div className="relative grid overflow-hidden rounded-[2rem] bg-ink text-white sm:grid-cols-[.9fr_1.1fr]">
            <div aria-hidden="true" className="absolute -left-20 -top-24 size-80 rounded-full bg-violet/30 blur-3xl" />
            <div className="relative z-10 flex flex-col items-start justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-14">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.18em] text-lime"><Sparkles size={12} /> GoKart pick</span>
              <p className="mt-6 text-[10px] font-bold uppercase tracking-[.2em] text-white/45">A little something different</p>
              <h2 className="mt-2 max-w-md text-3xl font-bold leading-[1.05] tracking-[-.06em] sm:text-4xl lg:text-5xl">Good taste looks good on you.</h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">Meet {editorPick.name} — a community favorite with the details that make everyday feel a little more extraordinary.</p>
              <Link className="gk-button mt-7 inline-flex items-center gap-3 rounded-full bg-lime px-5 py-3 text-sm font-bold text-ink" href={`/products/${editorPick.slug}`}>Meet the pick <ArrowRight size={16} /></Link>
            </div>
            <Link aria-label={`Discover ${editorPick.name}`} className="group relative min-h-[270px] overflow-hidden bg-violet sm:min-h-[380px]" href={`/products/${editorPick.slug}`}>
              {editorPick.images[0] && <Image alt={editorPick.images[0].alt || editorPick.name} className="object-cover transition duration-700 group-hover:scale-105" fill sizes="(max-width: 640px) 100vw, 55vw" src={editorPick.images[0].url} />}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-violet/10" />
              <span className="absolute bottom-6 right-6 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">{editorPick.brand || 'Selected for you'} ↗</span>
            </Link>
          </div>
        </section>}

        {newArrivals.length > 0 && <section className="pb-16 sm:pb-20">
          <SectionHeading eyebrow="Fresh on the scene" title="New & noteworthy." href="/products?sort=newest" linkLabel="Meet the new in" />
          <ProductGrid products={newArrivals} />
        </section>}
      </div>
    </div>
  );
}
