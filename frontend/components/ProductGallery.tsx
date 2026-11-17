'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import type { ProductImage } from '@/types/catalog';

type ProductGalleryProps = { images: ProductImage[]; productName: string };

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  const selectedImage = images[activeImage];

  return (
    <div className="lg:sticky lg:top-32">
      <div className="relative aspect-[.92] overflow-hidden rounded-[1.8rem] bg-gradient-to-br from-violet/[.10] via-paper to-coral/[.12] shadow-[0_20px_55px_rgba(17,24,39,.08)] sm:rounded-[2.2rem]">
        <div aria-hidden="true" className="absolute -right-8 -top-8 size-40 rounded-full border border-violet/15" />
        <AnimatePresence mode="wait">
          {selectedImage ? <motion.div animate={{ opacity: 1, scale: 1 }} className="absolute inset-0" exit={{ opacity: 0, scale: .99 }} initial={{ opacity: 0, scale: 1.02 }} key={selectedImage.url} transition={{ duration: .25 }}>
            <Image alt={selectedImage.alt || productName} className="object-cover" fill priority sizes="(max-width: 1024px) 100vw, 55vw" src={selectedImage.url} />
          </motion.div> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-violet/60"><ImageIcon size={34} /><span className="text-sm font-semibold">{productName}</span></div>}
        </AnimatePresence>
        <span className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] text-ink/65 backdrop-blur">GoKart select</span>
        {images.length > 1 && <span className="absolute bottom-4 right-4 rounded-full bg-ink/75 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur">{activeImage + 1} / {images.length}</span>}
      </div>
      {images.length > 1 && <div aria-label="Product images" className="mt-3 flex gap-3 overflow-x-auto pb-1">
        {images.map((image, index) => <button aria-label={`Show image ${index + 1} of ${images.length}`} aria-pressed={activeImage === index} className={`relative size-[72px] shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition sm:size-[84px] ${activeImage === index ? 'border-violet shadow-[0_5px_18px_rgba(121,87,255,.17)]' : 'border-transparent opacity-65 hover:opacity-100'}`} key={image.publicId || image.url} onClick={() => setActiveImage(index)} type="button"><Image alt="" className="object-cover" fill sizes="84px" src={image.url} /></button>)}
      </div>}
    </div>
  );
}
