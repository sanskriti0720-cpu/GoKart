'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCustomer } from '@/context/CustomerContext';
import { customerApi } from '@/services/customer';
import type { ProductReview } from '@/types/customer';

const reviewSchema = z.object({ rating: z.coerce.number().int().min(1).max(5), title: z.string().trim().max(100), body: z.string().trim().min(10, 'Share at least a little detail.').max(2000) });
type ReviewInput = z.input<typeof reviewSchema>;
type ReviewValues = z.output<typeof reviewSchema>;

export function ProductReviews({ productId, productSlug }: { productId: string; productSlug: string }) {
  const { user, notify } = useCustomer();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ReviewInput, unknown, ReviewValues>({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 5, title: '', body: '' } });

  useEffect(() => { customerApi.reviews(productSlug).then((result) => setReviews(result.reviews)).catch((error: unknown) => notify(error instanceof Error ? error.message : 'Could not load reviews.')).finally(() => setLoading(false)); }, [productSlug, notify]);

  const submit = handleSubmit(async (values) => {
    setServerError('');
    try {
      const result = await customerApi.createReview(productId, values);
      setReviews((current) => [result.review, ...current]);
      reset({ rating: 5, title: '', body: '' });
      notify('Thanks for sharing your experience.');
    } catch (error) { setServerError(error instanceof Error ? error.message : 'Could not submit your review.'); }
  });

  return <section className="mt-16 border-t border-[#e7e3dc] pt-10 sm:mt-20 sm:pt-14"><div className="mb-7"><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#b1674e]">From the community</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Customer reviews <span className="text-base font-normal text-[#8a928c]">({reviews.length})</span></h2></div>
    {user ? <form className="mb-8 rounded-2xl border border-[#ebe8e2] bg-white p-5 sm:p-6" onSubmit={submit}><h3 className="text-base font-semibold">Share your experience</h3><p className="mt-1 text-xs text-[#7b837e]">Only customers with a completed purchase can leave a verified review.</p><div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr]"><div><label className="mb-1.5 block text-xs font-medium" htmlFor="review-rating">Rating</label><select className="w-full rounded-xl border border-[#e6e2da] px-3 py-2.5 text-sm outline-none focus:border-[#c96c4d]" id="review-rating" {...register('rating')}><option value={5}>5 stars</option><option value={4}>4 stars</option><option value={3}>3 stars</option><option value={2}>2 stars</option><option value={1}>1 star</option></select></div><div><label className="mb-1.5 block text-xs font-medium" htmlFor="review-title">Headline <span className="font-normal text-[#929994]">(optional)</span></label><input className="w-full rounded-xl border border-[#e6e2da] px-3 py-2.5 text-sm outline-none focus:border-[#c96c4d]" id="review-title" maxLength={100} {...register('title')} /></div></div><div className="mt-4"><label className="mb-1.5 block text-xs font-medium" htmlFor="review-body">Your review</label><textarea className="w-full rounded-xl border border-[#e6e2da] px-3 py-2.5 text-sm outline-none focus:border-[#c96c4d]" id="review-body" rows={4} {...register('body')} />{errors.body && <p className="mt-1 text-xs text-red-700">{errors.body.message}</p>}</div>{serverError && <p className="mt-3 rounded-xl bg-[#fff3ef] p-3 text-sm text-[#a44934]" role="alert">{serverError}</p>}<button className="mt-4 rounded-xl bg-[#1e2321] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50" disabled={isSubmitting} type="submit">{isSubmitting ? 'Submitting…' : 'Submit review'}</button></form> : <div className="mb-8 rounded-2xl bg-white px-5 py-4 text-sm text-[#717a74]">Already purchased? <Link className="font-semibold text-[#b65b40] hover:underline" href="/account/sign-in">Sign in</Link> to share your review.</div>}
    {loading ? <div aria-label="Loading reviews" className="h-24 animate-pulse rounded-2xl bg-white" /> : reviews.length === 0 ? <div className="rounded-2xl border border-dashed border-[#d9d4ca] bg-white px-5 py-10 text-center"><Star className="mx-auto text-[#d28b44]" size={20} /><p className="mt-3 text-sm text-[#717a74]">No reviews yet. Be the first verified customer to share one.</p></div> : <div className="space-y-3">{reviews.map((review) => <article className="rounded-2xl border border-[#ebe8e2] bg-white p-5" key={review._id}><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold">{review.title || 'Customer review'}</p><p className="mt-1 text-xs text-[#7b837e]">{review.user.name} · {new Date(review.createdAt).toLocaleDateString()}</p></div><span className="inline-flex items-center gap-1 text-xs font-semibold text-[#6d746f]"><Star className="fill-[#d28b44] text-[#d28b44]" size={14} />{review.rating}/5 {review.isVerifiedPurchase && <span className="font-normal text-[#6f856f]">· Verified purchase</span>}</span></div><p className="mt-4 text-sm leading-6 text-[#606962]">{review.body}</p></article>)}</div>}
  </section>;
}
