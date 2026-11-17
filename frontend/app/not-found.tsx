import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center px-5 py-16 text-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b1674e]">404 — Not found</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#252b27]">That piece has moved on.</h1>
        <p className="mt-3 text-sm text-[#737c76]">Try a fresh look through the collection.</p>
        <Link className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1e2321] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#343b37]" href="/products"><ArrowLeft size={15} /> Browse products</Link>
      </div>
    </div>
  );
}
