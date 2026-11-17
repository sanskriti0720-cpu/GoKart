'use client';

import Link from 'next/link';
import { useCustomer } from '@/context/CustomerContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useCustomer();
  if (loading) return <div aria-label="Loading account" className="mx-auto max-w-3xl px-5 py-24"><div className="h-40 animate-pulse rounded-3xl bg-[#eeeae3]" /></div>;
  if (!user) return <section className="mx-auto max-w-xl px-5 py-24 text-center"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet">Your GoKart account</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Sign in to continue</h1><p className="mt-3 text-sm text-[#717a74]">Your saved items, orders, and account details are waiting for you.</p><Link className="gk-button mt-7 inline-flex rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white" href="/account/sign-in">Sign in</Link></section>;
  return children;
}
