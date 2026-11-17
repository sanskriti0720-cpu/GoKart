import Link from 'next/link';

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link aria-label="GoKart home" className="group inline-flex items-center gap-2.5" href="/">
      <span className={`relative grid size-10 place-items-center overflow-hidden rounded-[14px] transition-transform group-hover:-rotate-6 ${inverse ? 'bg-lime text-ink' : 'bg-violet text-white'}`}>
        <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 28 28">
          <path d="M4 6h2.2l2.1 11.2a2 2 0 0 0 2 1.6h9.9a2 2 0 0 0 1.9-1.4L24 10H8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.1" />
          <circle cx="11.5" cy="23" r="1.6" fill="currentColor" />
          <circle cx="20" cy="23" r="1.6" fill="currentColor" />
          <path d="m14 7 2 2 3-4" stroke={inverse ? '#7957ff' : '#c7f464'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </span>
      <span className={`text-[1.35rem] font-black tracking-[-.075em] ${inverse ? 'text-white' : 'text-ink'}`}>GoKart<span className={inverse ? 'text-lime' : 'text-violet'}>.</span></span>
    </Link>
  );
}
