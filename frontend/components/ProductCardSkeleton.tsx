export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="aspect-[4/4.5] rounded-2xl bg-[#eae6df]" />
      <div className="mt-4 h-3 w-1/3 rounded bg-[#e5e1d9]" />
      <div className="mt-2 h-4 w-4/5 rounded bg-[#e5e1d9]" />
      <div className="mt-3 h-4 w-1/3 rounded bg-[#e5e1d9]" />
    </div>
  );
}
