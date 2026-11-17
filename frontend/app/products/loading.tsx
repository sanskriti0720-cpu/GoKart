import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';

export default function ProductsLoading() {
  return (
    <div aria-label="Loading products" className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <div className="mb-8 h-10 w-56 animate-pulse rounded bg-[#e8e4dc]" />
      <div className="mb-8 h-20 animate-pulse rounded-2xl bg-[#eeeae3]" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <ProductCardSkeleton key={index} />)}</div>
    </div>
  );
}
