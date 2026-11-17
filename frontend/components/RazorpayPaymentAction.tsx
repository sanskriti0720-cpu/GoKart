'use client';

import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCustomer } from '@/context/CustomerContext';
import { customerApi } from '@/services/customer';

export function RazorpayPaymentAction({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { user, notify, refreshCart } = useCustomer();
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function payAgain() {
    setBusy(true);
    setError('');
    try {
      const result = await customerApi.retryPayment(orderId);
      if (!window.Razorpay) throw new Error('Razorpay Checkout is still loading. Please try again.');
      const checkout = new window.Razorpay({
        key: result.payment.keyId,
        amount: result.payment.amount,
        currency: result.payment.currency,
        name: 'GoKart',
        description: 'Thoughtful finds for everyday life',
        order_id: result.payment.razorpayOrderId,
        prefill: { name: user?.name || '', email: user?.email || '', contact: user?.phone || '' },
        theme: { color: '#7957FF' },
        handler: async (response) => {
          setBusy(true);
          try {
            await customerApi.verifyPayment(orderId, response);
            await refreshCart();
            notify('Payment confirmed. Thank you for your order.');
            router.refresh();
          } catch (issue) { setError(issue instanceof Error ? issue.message : 'Payment could not be verified.'); }
          finally { setBusy(false); }
        },
        modal: { ondismiss: () => setError('Payment was not completed. You can retry this order at any time.') },
      });
      checkout.on('payment.failed', (response) => setError(response.error?.description || 'Payment did not go through. Please retry.'));
      checkout.open();
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Could not open online payment.'); }
    finally { setBusy(false); }
  }

  return <div><Script id="razorpay-payment-retry" src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" onLoad={() => setLoaded(true)} onError={() => setLoaded(false)} /><button className="mt-5 w-full rounded-xl bg-[#1e2321] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50" disabled={!loaded || busy} onClick={payAgain} type="button">{busy ? 'Opening secure payment…' : loaded ? 'Continue payment' : 'Loading payment…'}</button>{error && <p className="mt-3 text-xs leading-5 text-[#a44934]" role="alert">{error}</p>}</div>;
}
