'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RazorpayPaymentAction } from '@/components/RazorpayPaymentAction';
import { useCustomer } from '@/context/CustomerContext';
import { customerApi } from '@/services/customer';
import type { CustomerOrder } from '@/types/customer';
import { formatPrice } from '@/utils/format';

export function OrderDetailContent() {
  const params = useParams<{ orderId: string }>();
  const { user, notify } = useCustomer();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (!user) return; customerApi.order(params.orderId).then((result) => setOrder(result.order)).catch((error: unknown) => notify(error instanceof Error ? error.message : 'Could not load this order.')).finally(() => setLoading(false)); }, [params.orderId, user, notify]);

  async function cancelOrder() {
    if (!order || !window.confirm('Cancel this order?')) return;
    setBusy(true);
    try { const result = await customerApi.cancelOrder(order._id); setOrder(result.order); notify('Your order has been cancelled.'); }
    catch (error) { notify(error instanceof Error ? error.message : 'Could not cancel this order.'); }
    finally { setBusy(false); }
  }

  return <ProtectedRoute><section className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14"><Link className="text-sm text-[#717a74] hover:text-[#b65b40]" href="/account/orders">← All orders</Link>{loading ? <div aria-label="Loading order" className="mt-7 h-56 animate-pulse rounded-2xl bg-[#eeeae3]" /> : !order ? <div className="mt-7 rounded-2xl border border-[#ebe8e2] bg-white p-8"><h1 className="text-xl font-semibold">Order not found</h1><p className="mt-2 text-sm text-[#717a74]">This order may have been removed or belongs to another account.</p></div> : <><div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b1674e]">Order details</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{order.orderNumber}</h1><p className="mt-2 text-sm text-[#7b837e]">Placed {new Date(order.createdAt).toLocaleString()}</p></div><span className="rounded-full bg-[#f4f0e8] px-3 py-1.5 text-xs font-semibold capitalize text-[#776447]">{order.status}</span></div>
    <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_300px]"><div className="space-y-3">{order.items.map((item, index) => <article className="flex gap-4 rounded-2xl border border-[#ebe8e2] bg-white p-4" key={`${item.slug}-${index}`}><Link className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-[#eeeae3]" href={`/products/${item.slug}`}>{item.image && <Image alt={item.name} className="object-cover" fill sizes="80px" src={item.image} />}</Link><div className="flex flex-1 items-center justify-between gap-3"><div><Link className="text-sm font-semibold hover:text-[#b65b40]" href={`/products/${item.slug}`}>{item.name}</Link><p className="mt-1 text-xs text-[#828a84]">Qty {item.quantity} · {formatPrice(item.unitPrice)} each</p></div><p className="text-sm font-semibold">{formatPrice(item.lineTotal)}</p></div></article>)}</div><aside className="rounded-2xl border border-[#ebe8e2] bg-white p-5"><h2 className="font-semibold">Payment</h2><p className="mt-3 text-sm capitalize text-[#68716b]">{order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Razorpay'}</p><p className="mt-1 text-xs capitalize text-[#87908a]">{order.paymentStatus}</p><div className="mt-5 border-t border-[#eeeae3] pt-4"><div className="flex justify-between text-sm font-semibold"><span>Total</span><span>{formatPrice(order.total)}</span></div></div>{order.paymentMethod === 'razorpay' && order.paymentStatus !== 'paid' && order.status === 'processing' && <RazorpayPaymentAction orderId={order._id} />}{order.paymentMethod === 'cod' && order.status === 'processing' && order.paymentStatus !== 'paid' && <button className="mt-5 w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-50" disabled={busy} onClick={cancelOrder} type="button">{busy ? 'Cancelling…' : 'Cancel order'}</button>}</aside></div></>}</section></ProtectedRoute>;
}
