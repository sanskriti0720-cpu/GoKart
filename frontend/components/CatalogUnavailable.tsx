import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

type CatalogUnavailableProps = {
  message?: string;
};

export function CatalogUnavailable({ message = 'We could not reach the product catalog just now.' }: CatalogUnavailableProps) {
  return (
    <div role="alert" className="rounded-3xl border border-[#ead3c4] bg-[#fff8f2] px-6 py-12 text-center sm:px-10">
      <p className="text-lg font-semibold tracking-tight text-[#503d31]">The shelves are taking a moment.</p>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#876c5d]">{message} Check that the GoKart API is running, then try again.</p>
      <Link className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1e2321] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#343b37]" href="/products">
        <RefreshCw aria-hidden="true" size={15} /> Try again
      </Link>
    </div>
  );
}
