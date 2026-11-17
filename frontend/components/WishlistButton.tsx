'use client';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCustomer } from '@/context/CustomerContext';

export function WishlistButton({ productId, compact = false }: { productId: string; compact?: boolean }) {
  const { user, wishlistIds, toggleWishlist, notify } = useCustomer();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const saved = wishlistIds.includes(productId);

  async function handleClick() {
    if (!user) { router.push('/account/sign-in'); return; }
    setBusy(true);
    try { await toggleWishlist(productId); }
    catch (error) { notify(error instanceof Error ? error.message : 'Could not update your wishlist.'); }
    finally { setBusy(false); }
  }

  return (
    <button aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={saved} className={`grid place-items-center rounded-full bg-white/95 text-[#3f4943] shadow-sm transition hover:text-[#c65f42] disabled:opacity-60 ${compact ? 'size-9' : 'size-10'}`} disabled={busy} onClick={handleClick} type="button">
      <Heart className={saved ? 'fill-[#d97859] text-[#d97859]' : ''} size={compact ? 17 : 18} strokeWidth={1.7} />
    </button>
  );
}
