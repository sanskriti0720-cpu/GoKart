import Link from 'next/link';
import type { Product } from '@/types/catalog';
import { ProductCard } from '@/components/ProductCard';

type ProductGridProps = {
  products: Product[];
  emptyMessage?: string;
};

export function ProductGrid({ products, emptyMessage = 'No products match those filters just yet.' }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[#d9d4ca] bg-white/70 px-6 py-16 text-center">
        <p className="text-lg font-medium text-[#343b37]">Nothing here for now.</p>
        <p className="mt-2 text-sm text-[#7b837e]">{emptyMessage}</p>
        <Link className="mt-5 inline-flex rounded-full bg-[#1e2321] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#343b37]" href="/products">Browse all products</Link>
      </div>
    );
  }

  return <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div>;
}
