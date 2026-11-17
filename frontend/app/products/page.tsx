import type { Metadata } from 'next';
import { ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { CatalogUnavailable } from '@/components/CatalogUnavailable';
import { Pagination } from '@/components/Pagination';
import { ProductFilters } from '@/components/ProductFilters';
import { ProductGrid } from '@/components/ProductGrid';
import { CatalogApiError, getCategories, getProducts } from '@/services/catalog';
import type { ProductQuery } from '@/types/catalog';

export const metadata: Metadata = {
  title: 'Shop all | GoKart',
  description: 'Browse the latest finds, everyday favorites, and GoKart picks.',
};

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toQuery(searchParams: Record<string, string | string[] | undefined>): ProductQuery {
  const rawSort = firstValue(searchParams.sort);
  const sort = ['newest', 'popular', 'price_asc', 'price_desc'].includes(rawSort || '') ? rawSort : 'newest';
  const rawPage = Number(firstValue(searchParams.page));
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? String(rawPage) : '1';
  const query: ProductQuery = { sort, page, limit: '12' };

  for (const key of ['q', 'category', 'brand', 'minRating', 'minPrice', 'maxPrice'] as const) {
    const value = firstValue(searchParams[key])?.trim();
    if (value) query[key] = value;
  }

  return query;
}

function withoutFilter(query: ProductQuery, key: keyof ProductQuery) {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(query)) if (name !== key && name !== 'page' && value) params.set(name, value);
  const suffix = params.toString();
  return suffix ? `/products?${suffix}` : '/products';
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const query = toQuery(await searchParams);
  const [categoriesResult, productsResult] = await Promise.allSettled([getCategories(), getProducts(query)]);
  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
  const hasError = productsResult.status === 'rejected';
  const invalidRange = query.minPrice !== undefined && query.maxPrice !== undefined && Number(query.minPrice) > Number(query.maxPrice);
  const activeFilters = [
    ...(query.q ? [{ key: 'q' as const, label: `“${query.q}”` }] : []),
    ...(query.category ? [{ key: 'category' as const, label: categories.find((category) => category.slug === query.category)?.name || query.category }] : []),
    ...(query.brand ? [{ key: 'brand' as const, label: `Brand: ${query.brand}` }] : []),
    ...(query.minRating ? [{ key: 'minRating' as const, label: `${query.minRating}+ stars` }] : []),
    ...(query.minPrice || query.maxPrice ? [{ key: 'minPrice' as const, label: `${query.minPrice ? `₹${query.minPrice}` : '₹0'} — ${query.maxPrice ? `₹${query.maxPrice}` : 'Any price'}` }] : []),
  ];

  return (
    <div className="min-h-[60vh] bg-paper text-ink">
      <section className="relative overflow-hidden border-b border-ink/[.06] bg-white">
        <div aria-hidden="true" className="absolute -right-24 -top-24 size-72 rounded-full bg-violet/[.07] blur-2xl" />
        <div className="relative mx-auto max-w-[1440px] px-5 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-14 lg:px-12">
          <p className="text-[9px] font-extrabold uppercase tracking-[.2em] text-violet">The GoKart collection</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div><h1 className="text-[clamp(2.6rem,7vw,5.2rem)] font-black leading-none tracking-[-.08em]">{query.q ? <>You searched <span className="text-violet">“{query.q}”</span></> : 'Find your thing.'}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-ink/55 sm:text-base">Good design, useful details, and a few things you didn’t know you needed.</p></div>
            <Link className="group inline-flex items-center gap-2 pb-1 text-xs font-bold text-violet" href="/products?sort=popular">See what’s trending <ArrowRight className="transition group-hover:translate-x-1" size={15} /></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-10 lg:px-12">
        <div className="grid items-start gap-5 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-8">
          <ProductFilters categories={categories} query={query} />
          <div className="min-w-0">
            {!invalidRange && productsResult.status === 'fulfilled' && <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-ink/50"><strong className="text-ink">{productsResult.value.pagination.total}</strong> things worth a look</p>
              {activeFilters.length > 0 && <div className="flex flex-wrap items-center gap-2">{activeFilters.map((filter) => <Link className="inline-flex items-center gap-1.5 rounded-full border border-violet/15 bg-white px-3 py-1.5 text-[10px] font-bold text-violet transition hover:bg-violet/5" href={withoutFilter(query, filter.key)} key={filter.key}>{filter.label}<X size={11} /></Link>)}<Link className="px-2 py-1 text-[10px] font-bold text-ink/40 underline underline-offset-2 hover:text-coral" href="/products">Clear all</Link></div>}
            </div>}
            {invalidRange ? <div role="alert" className="rounded-2xl border border-coral/20 bg-white px-5 py-5 text-sm text-ink/65">The minimum price needs to be lower than the maximum. Give that range another try.</div>
              : hasError ? <CatalogUnavailable message={productsResult.reason instanceof CatalogApiError ? productsResult.reason.message : undefined} />
                : <><ProductGrid products={productsResult.value.products} /><Pagination pagination={productsResult.value.pagination} query={query} /></>}
          </div>
        </div>
      </section>
    </div>
  );
}
