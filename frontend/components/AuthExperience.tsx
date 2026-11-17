import { ArrowUpRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AuthForm } from '@/components/AuthForm';
import { BrandMark } from '@/components/BrandMark';
import { getProducts } from '@/services/catalog';

export async function AuthExperience({ mode }: { mode: 'login' | 'register' }) {
  const result = await getProducts({ sort: 'popular', limit: '1' }).catch(() => null);
  const feature = result?.products[0];
  const isRegister = mode === 'register';

  return (
    <section className="mx-auto max-w-[1320px] px-4 py-6 sm:px-7 sm:py-10 lg:px-10 lg:py-14">
      <div className="grid overflow-hidden rounded-[2rem] border border-ink/[.06] bg-white shadow-[0_25px_90px_rgba(17,24,39,.09)] md:min-h-[680px] md:grid-cols-[1fr_.9fr]">
        <div className="order-2 flex flex-col justify-center p-6 sm:p-10 md:order-1 lg:p-14">
          <BrandMark />
          <div className="mt-9 max-w-md sm:mt-12">
            <p className="text-[9px] font-extrabold uppercase tracking-[.2em] text-violet">{isRegister ? 'Your next great find awaits' : 'Good to have you back'}</p>
            <h1 className="mt-3 text-[clamp(2.3rem,5vw,3.7rem)] font-black leading-[.98] tracking-[-.075em] text-ink">{isRegister ? <>Join the <span className="text-violet">good finds</span> club.</> : <>Welcome<br />back<span className="text-coral">.</span></>}</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-ink/55">{isRegister ? 'One account. Your saved picks, orders and addresses — all in one easy place.' : 'Your saved picks and everyday upgrades are right where you left them.'}</p>
          </div>
          <div className="mt-8 max-w-md"><AuthForm mode={mode} /></div>
          <p className="mt-7 text-[10px] text-ink/35">By continuing, you agree to shop thoughtfully and discover more.</p>
        </div>
        <div className="order-1 relative min-h-[245px] overflow-hidden bg-ink md:order-2 md:min-h-full">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_78%_17%,#7957ff_0,transparent_38%),radial-gradient(circle_at_8%_92%,#ff6b6b88_0,transparent_34%),linear-gradient(140deg,#242238,#111827_66%)]" />
          {feature?.images[0] && <Image alt={feature.images[0].alt || feature.name} className="object-cover opacity-80 mix-blend-screen" fill priority sizes="(max-width: 768px) 100vw, 44vw" src={feature.images[0].url} />}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/15 to-transparent" />
          <div aria-hidden="true" className="absolute -right-20 top-8 size-72 rounded-full border border-white/15 md:size-[26rem]" />
          <div aria-hidden="true" className="absolute -right-10 top-20 size-56 rounded-full border border-white/10 md:size-[21rem]" />
          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[.17em] text-white backdrop-blur-xl sm:left-8 sm:top-8"><Sparkles className="text-lime" size={13} /> Discover More. Shop Better.</div>
          <div className="absolute bottom-6 left-5 right-5 text-white sm:bottom-10 sm:left-8 sm:right-8 lg:bottom-14 lg:left-12">
            <p className="text-[9px] font-extrabold uppercase tracking-[.2em] text-lime">The GoKart point of view</p>
            <p className="mt-2 max-w-lg text-2xl font-black leading-tight tracking-[-.06em] sm:text-3xl lg:text-4xl">Less scrolling. More “that’s so me.”</p>
            <p className="mt-3 max-w-md text-xs leading-5 text-white/65 sm:text-sm">Curated discoveries for your life, your style, and all the little moments in between.</p>
            {feature && <Link className="mt-5 inline-flex max-w-full items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-2.5 pr-4 backdrop-blur-xl transition hover:bg-white/15" href={`/products/${feature.slug}`}>
              {feature.images[0] && <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-white/10"><Image alt="" className="object-cover" fill sizes="48px" src={feature.images[0].url} /></span>}
              <span className="min-w-0"><span className="block text-[8px] font-bold uppercase tracking-[.16em] text-white/50">Today’s find</span><span className="mt-1 block truncate text-[11px] font-bold">{feature.name}</span></span>
              <ArrowUpRight className="ml-auto shrink-0 text-lime" size={15} />
            </Link>}
          </div>
          <Link aria-label="Back to shopping" className="absolute right-5 top-5 grid size-9 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur sm:right-8 sm:top-8" href="/products"><ArrowUpRight size={16} /></Link>
        </div>
      </div>
    </section>
  );
}
