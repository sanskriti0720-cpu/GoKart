import { Star } from 'lucide-react';

type RatingStarsProps = {
  rating: number;
  count: number;
};

export function RatingStars({ rating, count }: RatingStarsProps) {
  if (count === 0) {
    return <span className="text-xs text-[#818984]">New arrival</span>;
  }

  return (
    <span aria-label={`${rating.toFixed(1)} out of 5 stars from ${count} reviews`} className="inline-flex items-center gap-1.5 text-xs text-[#6d746f]">
      <Star aria-hidden="true" className="fill-[#d28b44] text-[#d28b44]" size={13} />
      <span className="font-semibold text-[#353b37]">{rating.toFixed(1)}</span>
      <span>({count})</span>
    </span>
  );
}
