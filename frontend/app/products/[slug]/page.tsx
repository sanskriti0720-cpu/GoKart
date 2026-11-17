import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Check, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import { CatalogUnavailable } from '@/components/CatalogUnavailable';
import { ProductGallery } from '@/components/ProductGallery';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductPurchaseActions } from '@/components/ProductPurchaseActions';
import { ProductReviews } from '@/components/ProductReviews';
import { RatingStars } from '@/components/RatingStars';
import { SectionHeading } from '@/components/SectionHeading';
import { CatalogApiError, getProduct, getRelatedProducts } from '@/services/catalog';
import type { Product } from '@/types/catalog';
import { formatPrice, getDiscountPercent } from '@/utils/format';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProduct(slug);
    return { title: `${product.name} | GoKart`, description: product.description.slice(0, 160) };
  } catch { return { title: 'Product | GoKart' }; }
}

function VariantList({ product }: { product: Product }) {
  const variantGroups = new Map<string, string[]>();
  for (const variant of product.variants) variantGroups.set(variant.name, [...(variantGroups.get(variant.name) || []), variant.value]);
  if (variantGroups.size === 0) return null;

  return <div className="mt-6 space-y-4 border-t border-ink/[.08] pt-5">{[...variantGroups.entries()].map(([name, values]) => <div key={name}><p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-ink/55">{name}</p><div className="mt-2 flex flex-wrap gap-2">{[...new Set(values)].map((value) => <span className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink/70" key={value}>{value}</span>)}</div></div>)}</div>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  let product: Product;
  try { product = await getProduct(slug); }
  catch (error) {
    if (error instanceof CatalogApiError && error.status === 404) notFound();
    return <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8"><CatalogUnavailable message={error instanceof Error ? error.message : undefined} /></div>;
  }

  const relatedProducts = await getRelatedProducts(slug).catch(() => []);
  const discount = getDiscountPercent(product.price, product.compareAtPrice);
  const fromPrice = product.variants.some((variant) => variant.price !== undefined)
    ? Math.min(product.price, ...product.variants.map((variant) => variant.price ?? product.price))
    : product.price;

  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-[1440px] px-5 pb-14 pt-6 sm:px-8 sm:pb-20 sm:pt-9 lg:px-12">
        <Link className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-ink/45 transition hover:text-violet" href="/products"><ArrowLeft size={15} /> Back to the good stuff</Link>
        <div className="grid items-start gap-8 lg:grid-cols-[1.08fr_.92fr] lg:gap-14">
          <ProductGallery images={product.images} productName={product.name} />
          <div className="rounded-[1.7rem] border border-ink/[.06] bg-white p-5 shadow-[0_20px_60px_rgba(17,24,39,.045)] sm:p-8 lg:p-9">
            {product.category && <Link className="inline-flex items-center gap-1.5 rounded-full bg-violet/5 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[.16em] text-violet transition hover:bg-violet/10" href={`/products?category=${encodeURIComponent(product.category.slug)}`}>{product.category.name}<ArrowUpRight size={12} /></Link>}
            {product.brand && <p className="mt-4 text-[10px] font-bold uppercase tracking-[.18em] text-ink/40">{product.brand}</p>}
            <h1 className="mt-2 text-[clamp(2rem,5vw,3.6rem)] font-black leading-[.98] tracking-[-.075em]">{product.name}</h1>
            <div className="mt-4"><RatingStars count={product.ratingCount} rating={product.ratingAverage} /></div>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-3xl font-black tracking-[-.06em]">{fromPrice !== product.price ? `From ${formatPrice(fromPrice)}` : formatPrice(product.price)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && <span className="text-sm text-ink/35 line-through">{formatPrice(product.compareAtPrice)}</span>}
              {discount && <span className="rounded-full bg-coral/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.08em] text-coral">Save {discount}%</span>}
            </div>
            <p className="mt-5 text-sm leading-7 text-ink/60">{product.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">{product.tags.slice(0, 4).map((tag) => <span className="rounded-full bg-paper px-3 py-1.5 text-[9px] font-bold text-ink/50" key={tag}>#{tag.replaceAll(' ', '')}</span>)}</div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-y border-ink/[.08] py-4 text-[11px]">
              <span className={`inline-flex items-center gap-2 font-bold ${product.stock > 0 ? 'text-emerald-700' : 'text-coral'}`}>{product.stock > 0 ? <Check size={14} /> : <PackageCheck size={14} />}{product.stock > 0 ? 'In stock' : 'Currently unavailable'}</span>
              {product.stock > 0 && <span className="text-ink/45">{product.stock} available</span>}
              <span className="text-ink/40">SKU {product.sku}</span>
            </div>

            <VariantList product={product} />
            <ProductPurchaseActions product={product} />

            <div className="mt-6 grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded-xl bg-paper p-3"><Truck className="shrink-0 text-violet" size={16} /><span className="text-[9px] font-semibold leading-4 text-ink/60">Free delivery over ₹3,000</span></div>
              <div className="flex items-center gap-2 rounded-xl bg-paper p-3"><ShieldCheck className="shrink-0 text-violet" size={16} /><span className="text-[9px] font-semibold leading-4 text-ink/60">Secure checkout</span></div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && <section className="mt-16 border-t border-ink/[.08] pt-10 sm:mt-20 sm:pt-14"><SectionHeading eyebrow="Keep the good finds coming" title="You might also love." /><ProductGrid products={relatedProducts} /></section>}
        <ProductReviews productId={product._id} productSlug={product.slug} />
      </div>
    </div>
  );
}
