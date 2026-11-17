import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import type { Product } from '@/types/catalog';
import { formatPrice, getDiscountPercent } from '@/utils/format';
import { RatingStars } from '@/components/RatingStars';
import { QuickViewButton } from '@/components/QuickViewButton';
import { WishlistButton } from '@/components/WishlistButton';

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  const secondImage = product.images[1];
  const discount = getDiscountPercent(product.price, product.compareAtPrice);

  return (
    <article className="group min-w-0">
      <div className="relative">
        <Link aria-label={`View ${product.name}`} className="gk-image-zoom relative block aspect-[.84] overflow-hidden rounded-[1.35rem] bg-[#eeedf2]" href={`/products/${product.slug}`}>
          {image ? <Image alt={image.alt || product.name} className="object-cover" fill sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 25vw" src={image.url} /> : <div className="grid h-full place-items-center bg-gradient-to-br from-violet/15 to-coral/15 p-5 text-center text-sm font-semibold">{product.name}</div>}
          {secondImage && <Image alt={secondImage.alt || product.name} className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" fill sizes="(max-width: 640px) 48vw, 25vw" src={secondImage.url} />}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/15 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          {discount && <span className="absolute left-3 top-3 rounded-full bg-coral px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[.08em] text-white shadow-lg">-{discount}%</span>}
          {product.isFeatured && <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-lime px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[.08em] text-ink"><Sparkles size={11} /> GoKart pick</span>}
          {product.stock === 0 && <span className="absolute bottom-3 left-3 rounded-full bg-ink/85 px-2.5 py-1.5 text-[9px] font-bold text-white">Sold out</span>}
          <span aria-hidden="true" className="absolute bottom-3 right-3 grid size-9 translate-y-2 place-items-center rounded-full bg-white text-ink opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight size={17} /></span>
        </Link>
        <span className="absolute right-3 top-3 z-10"><WishlistButton compact productId={product._id} /></span>
        <div className="absolute bottom-3 left-1/2 z-10 hidden -translate-x-1/2 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:block"><QuickViewButton product={product} /></div>
        <div className="mt-2 sm:hidden"><QuickViewButton product={product} /></div>
      </div>
      <Link className="mt-3 block" href={`/products/${product.slug}`}>
        <p className="truncate text-[9px] font-extrabold uppercase tracking-[.15em] text-violet/80">{product.brand || product.category?.name}</p>
        <h3 className="mt-1 line-clamp-2 min-h-10 text-[13px] font-bold leading-5 tracking-[-.02em] text-ink transition group-hover:text-violet sm:text-sm">{product.name}</h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-sm font-extrabold tracking-[-.02em] text-ink">{formatPrice(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && <span className="text-[11px] font-medium text-ink/35 line-through">{formatPrice(product.compareAtPrice)}</span>}
        </div>
        <div className="mt-1.5"><RatingStars count={product.ratingCount} rating={product.ratingAverage} /></div>
      </Link>
    </article>
  );
}
