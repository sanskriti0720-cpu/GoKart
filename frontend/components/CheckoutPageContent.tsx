'use client';

import Script from 'next/script';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useCustomer } from '@/context/CustomerContext';
import { customerApi } from '@/services/customer';
import type { PaymentIntent } from '@/services/customer';
import { formatPrice } from '@/utils/format';

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayFailure = { error?: { description?: string } };
type RazorpayInstance = {
  open: () => void;
  on: (event: 'payment.failed', listener: (response: RazorpayFailure) => void) => void;
};
type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
};

declare global {
  interface Window { Razorpay?: new (options: RazorpayOptions) => RazorpayInstance }
}

export function CheckoutPageContent() {
  const router = useRouter();
  const { user, cart, refreshCart, notify } = useCustomer();
  const [addressId, setAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  const [busy, setBusy] = useState(false);
  const [checkoutLoaded, setCheckoutLoaded] = useState(false);
  const [error, setError] = useState('');
  const selectedAddressId = addressId || user?.addresses.find((address) => address.isDefault)?._id || user?.addresses[0]?._id || '';
  const shipping = cart.subtotal === 0 || cart.subtotal >= 3000 ? 0 : 99;
  const total = useMemo(() => cart.subtotal + shipping, [cart.subtotal, shipping]);

  async function submitCheckout() {
    if (!selectedAddressId) { setError('Please choose a shipping address.'); return; }
    if (paymentMethod === 'razorpay' && !checkoutLoaded) { setError('Online checkout is still loading. Please try again in a moment.'); return; }
    setBusy(true);
    setError('');
    try {
      const result = await customerApi.createCheckout(selectedAddressId, paymentMethod);
      await refreshCart();
      if (paymentMethod === 'cod') {
        notify('Order placed. Cash on delivery selected.');
        router.replace(`/account/orders/${result.order._id}`);
        return;
      }
      if (!result.payment) throw new Error('The payment service did not return a checkout order.');
      launchPayment(result.order._id, result.payment);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Could not create your order.');
    } finally { setBusy(false); }
  }

  function launchPayment(orderId: string, payment: PaymentIntent) {
    if (!window.Razorpay) { setError('Razorpay Checkout is not available right now. Return to your order and retry payment.'); return; }
    const checkout = new window.Razorpay({
      key: payment.keyId,
      amount: payment.amount,
      currency: payment.currency,
      name: 'GoKart',
      description: 'Thoughtful finds for everyday life',
      order_id: payment.razorpayOrderId,
      prefill: { name: user?.name || '', email: user?.email || '', contact: user?.phone || '' },
      theme: { color: '#7957FF' },
      handler: async (response) => {
        setBusy(true);
        setError('');
        try {
          await customerApi.verifyPayment(orderId, response);
          notify('Payment confirmed. Thank you for your order.');
          router.replace(`/account/orders/${orderId}`);
        } catch (issue) {
          setError(issue instanceof Error ? issue.message : 'Payment confirmation could not be completed. Open your order to retry.');
        } finally { setBusy(false); }
      },
      modal: { ondismiss: () => setError('Payment was not completed. Your order is saved; you can retry payment from its details.') },
    });
    checkout.on('payment.failed', (response) => setError(response.error?.description || 'Payment did not go through. You can retry from your order details.'));
    checkout.open();
  }

  return <ProtectedRoute><Script id="razorpay-checkout" src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" onLoad={() => setCheckoutLoaded(true)} onError={() => setCheckoutLoaded(false)} />
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b1674e]">Almost yours</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Checkout</h1>
      {cart.items.length === 0 ? <div className="mt-8 rounded-3xl border border-[#ebe8e2] bg-white px-6 py-14 text-center"><p className="text-lg font-medium">Your bag is empty.</p><Link className="mt-5 inline-flex rounded-xl bg-[#1e2321] px-6 py-3 text-sm font-semibold text-white" href="/products">Explore the collection</Link></div> : <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6"><section className="rounded-2xl border border-[#ebe8e2] bg-white p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">Delivery address</h2><p className="mt-1 text-xs text-[#7b837e]">Select where you would like your order sent.</p></div><Link className="text-xs font-semibold text-[#b65b40] hover:underline" href="/account">Manage addresses</Link></div>
          {user?.addresses.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2">{user.addresses.map((address) => <label className={`cursor-pointer rounded-xl border p-4 transition ${selectedAddressId === address._id ? 'border-[#c96c4d] bg-[#fffaf6]' : 'border-[#eeeae3] hover:border-[#d5b7a6]'}`} key={address._id}><span className="flex items-center gap-2"><input checked={selectedAddressId === address._id} className="accent-[#c96c4d]" name="shipping-address" onChange={() => setAddressId(address._id)} type="radio" /><span className="text-sm font-semibold">{address.label}</span>{address.isDefault && <span className="text-[9px] font-semibold uppercase tracking-wide text-[#987451]">Default</span>}</span><span className="mt-2 block pl-5 text-xs leading-5 text-[#737b75]">{address.name} · {address.phone}<br />{address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />{address.city}, {address.state} {address.postalCode}<br />{address.country}</span></label>)}</div> : <div className="mt-5 rounded-xl bg-[#f8f7f4] p-4"><p className="text-sm text-[#68716b]">Add a delivery address to continue.</p><Link className="mt-2 inline-flex text-sm font-semibold text-[#b65b40] hover:underline" href="/account">Add address to your account →</Link></div>}
        </section>
        <section className="rounded-2xl border border-[#ebe8e2] bg-white p-5 sm:p-6"><h2 className="text-lg font-semibold">Payment method</h2><div className="mt-4 space-y-3"><label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${paymentMethod === 'cod' ? 'border-[#c96c4d] bg-[#fffaf6]' : 'border-[#eeeae3]'}`}><input checked={paymentMethod === 'cod'} className="mt-0.5 accent-[#c96c4d]" name="payment-method" onChange={() => setPaymentMethod('cod')} type="radio" /><span><span className="block text-sm font-semibold">Cash on Delivery</span><span className="mt-1 block text-xs text-[#7b837e]">Pay when your order arrives.</span></span></label><label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${paymentMethod === 'razorpay' ? 'border-[#c96c4d] bg-[#fffaf6]' : 'border-[#eeeae3]'}`}><input checked={paymentMethod === 'razorpay'} className="mt-0.5 accent-[#c96c4d]" name="payment-method" onChange={() => setPaymentMethod('razorpay')} type="radio" /><span><span className="block text-sm font-semibold">Pay online with Razorpay</span><span className="mt-1 block text-xs text-[#7b837e]">Cards, UPI and other enabled test methods.</span></span></label></div></section>
        {error && <p className="rounded-xl bg-[#fff3ef] p-4 text-sm text-[#a44934]" role="alert">{error}</p>}</div>
        <aside className="rounded-2xl border border-[#ebe8e2] bg-white p-5 sm:p-6"><h2 className="text-lg font-semibold">Order summary</h2><div className="mt-5 space-y-3 border-b border-[#eeeae3] pb-5 text-sm"><div className="flex justify-between text-[#68716b]"><span>Items ({cart.itemCount})</span><span>{formatPrice(cart.subtotal)}</span></div><div className="flex justify-between text-[#68716b]"><span>Shipping</span><span>{shipping ? formatPrice(shipping) : 'Free'}</span></div>{cart.items.map((item) => <div className="flex justify-between gap-3 text-xs text-[#7b837e]" key={item._id}><span className="line-clamp-1">{item.product.name} × {item.quantity}</span><span>{formatPrice(item.lineTotal)}</span></div>)}</div><div className="mt-5 flex justify-between text-base font-semibold"><span>Total</span><span>{formatPrice(total)}</span></div><button className="gk-button mt-6 w-full rounded-xl bg-violet px-5 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || !user?.addresses.length || !selectedAddressId || (paymentMethod === 'razorpay' && !checkoutLoaded)} onClick={submitCheckout} type="button">{busy ? 'Processing…' : paymentMethod === 'cod' ? 'Place COD order' : checkoutLoaded ? 'Continue to secure payment' : 'Loading payment…'}</button><p className="mt-3 text-center text-[10px] leading-4 text-[#8b928d]">Your final price and stock are verified securely by GoKart.</p></aside>
      </div>}
    </section>
  </ProtectedRoute>;
}
