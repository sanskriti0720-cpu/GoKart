import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
};

export function SectionHeading({ eyebrow, title, href, linkLabel = 'View all' }: SectionHeadingProps) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[.2em] text-violet sm:text-[10px]">{eyebrow}</p>
        <h2 className="mt-2 text-[clamp(1.8rem,4vw,3rem)] font-bold leading-none tracking-[-.065em] text-ink">{title}</h2>
      </div>
      {href && <Link className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3.5 py-2.5 text-[10px] font-bold text-ink/65 transition hover:border-violet/30 hover:text-violet sm:px-4 sm:text-xs" href={href}>{linkLabel}<ArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={14} /></Link>}
    </div>
  );
}
