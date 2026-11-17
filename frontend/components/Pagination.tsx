import Link from 'next/link';
import type { ProductPagination, ProductQuery } from '@/types/catalog';

type PaginationProps = {
  pagination: ProductPagination;
  query: ProductQuery;
};

function pageHref(query: ProductQuery, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...query, page: String(page) })) {
    if (value) params.set(key, value);
  }
  return `/products?${params.toString()}`;
}

export function Pagination({ pagination, query }: PaginationProps) {
  if (pagination.totalPages <= 1) return null;

  return (
    <nav aria-label="Product pages" className="mt-10 flex items-center justify-between border-t border-[#e7e4dd] pt-5">
      <span className="text-xs text-[#77807a]">Page {pagination.page} of {pagination.totalPages}</span>
      <div className="flex gap-2">
        {pagination.page > 1 && <Link className="rounded-full border border-[#ddd9d1] px-4 py-2 text-xs font-medium text-[#404743] transition hover:border-[#1e2321]" href={pageHref(query, pagination.page - 1)}>Previous</Link>}
        {pagination.page < pagination.totalPages && <Link className="rounded-full bg-[#1e2321] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#343b37]" href={pageHref(query, pagination.page + 1)}>Next</Link>}
      </div>
    </nav>
  );
}
