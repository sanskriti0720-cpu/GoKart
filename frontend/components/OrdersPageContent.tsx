'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useCustomer } from '@/context/CustomerContext';
import { customerApi } from '@/services/customer';
import type { CustomerOrder } from '@/types/customer';
import { formatPrice } from '@/utils/format';

export function OrdersPageContent() {
  const { user, notify } = useCustomer();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (user) customerApi.orders().then((result) => setOrders(result.orders)).catch((error: unknown) => notify(error instanceof Error ? error.message : 'Could not load your orders.')).finally(() => setLoading(false)); }, [user, notify]);
  return <ProtectedRoute><section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b1674e]">Your purchases</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Order history</h1>
    {loading ? <div aria-label="Loading orders" className="mt-8 space-y-3">{[1, 2].map((entry) => <div className="h-28 animate-pulse rounded-2xl bg-[#eeeae3]" key={entry} />)}</div> : orders.length === 0 ? <div className="mt-8 rounded-3xl border border-[#ebe8e2] bg-white px-6 py-16 text-center"><p className="text-lg font-medium">Your first order is still ahead.</p><p className="mt-2 text-sm text-[#717a74]">When you find something you love, your order details will live here.</p><Link className="mt-6 inline-flex rounded-xl bg-[#1e2321] px-6 py-3 text-sm font-semibold text-white" href="/products">Explore the collection</Link><p className="mt-4 text-xs text-[#87908a]">Checkout and order placement are being added in the next phase.</p></div> : <div className="mt-8 space-y-3">{orders.map((order) => <Link className="block rounded-2xl border border-[#ebe8e2] bg-white p-4 transition hover:border-[#d5b7a6] sm:p-5" href={`/account/orders/${order._id}`} key={order._id}><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold">{order.orderNumber}</p><p className="mt-1 text-xs text-[#858d87]">Placed {new Date(order.createdAt).toLocaleDateString()}</p></div><div className="text-right"><p className="text-sm font-semibold">{formatPrice(order.total)}</p><span className="mt-1 inline-flex rounded-full bg-[#f4f0e8] px-2.5 py-1 text-[10px] font-semibold capitalize text-[#776447]">{order.status}</span></div></div><div className="mt-4 flex gap-2">{order.items.slice(0, 4).map((item, index) => <div className="relative size-12 overflow-hidden rounded-lg bg-[#eeeae3]" key={`${item.slug}-${index}`}>{item.image && <Image alt={item.name} className="object-cover" fill sizes="48px" src={item.image} />}</div>)}<span className="self-center text-xs text-[#828a84]">{order.items.length} {order.items.length === 1 ? 'item' : 'items'} · {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Online payment'}</span></div></Link>)}</div>}
  </section></ProtectedRoute>;
}
