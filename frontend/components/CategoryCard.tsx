'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Armchair, AudioLines, Shirt } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Category } from '@/types/catalog';

const categoryIcons = { 'home-living': Armchair, technology: AudioLines, style: Shirt };

export function CategoryCard({ category, index = 0 }: { category: Category; index?: number }) {
  const reduceMotion = useReducedMotion();
  const Icon = categoryIcons[category.slug as keyof typeof categoryIcons] || Armchair;
  const lightText = Boolean(category.image);

  return (
    <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} transition={{ delay: index * .07, duration: .45 }} viewport={{ once: true, amount: .2 }} whileInView={{ opacity: 1, y: 0 }} whileHover={reduceMotion ? undefined : { y: -5 }}>
      <Link className={`group relative flex min-h-[235px] overflow-hidden rounded-[1.6rem] p-5 shadow-[0_15px_45px_rgba(17,24,39,.08)] sm:min-h-[280px] sm:p-7 ${index === 1 ? 'sm:mt-8' : index === 2 ? 'sm:mt-2' : ''} ${lightText ? 'text-white' : 'bg-gradient-to-br from-violet/15 via-paper to-coral/20 text-ink'}`} href={`/products?category=${encodeURIComponent(category.slug)}`}>
        {category.image && <Image alt="" className="object-cover transition duration-700 group-hover:scale-110" fill sizes="(max-width: 640px) 100vw, 33vw" src={category.image} />}
        <div className={`absolute inset-0 transition ${lightText ? 'bg-gradient-to-t from-ink/85 via-ink/15 to-ink/10 group-hover:from-ink/90' : 'bg-gradient-to-br from-white/15 via-transparent to-violet/10'}`} />
        <div aria-hidden="true" className="absolute -right-9 -top-10 size-40 rounded-full border border-white/30 transition-transform duration-700 group-hover:scale-110 sm:size-52" />
        <div className="relative z-10 mt-auto flex w-full items-end justify-between gap-3">
          <div>
            <span className={`mb-4 inline-flex size-10 items-center justify-center rounded-xl backdrop-blur-md ${lightText ? 'bg-white/15 text-lime' : 'bg-violet text-white'}`}><Icon size={18} /></span>
            <h3 className="text-xl font-bold tracking-[-.045em] sm:text-2xl">{category.name}</h3>
            <p className={`mt-1.5 line-clamp-2 max-w-56 text-xs leading-5 ${lightText ? 'text-white/70' : 'text-ink/55'}`}>{category.description}</p>
          </div>
          <span aria-hidden="true" className={`grid size-10 shrink-0 place-items-center rounded-full transition group-hover:rotate-45 ${lightText ? 'bg-white text-ink' : 'bg-lime text-ink'}`}><ArrowUpRight size={18} /></span>
        </div>
      </Link>
    </motion.div>
  );
}
