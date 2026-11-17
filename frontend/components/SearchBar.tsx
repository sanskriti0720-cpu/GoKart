import { Search } from 'lucide-react';

type SearchBarProps = {
  defaultValue?: string;
  inputId: string;
  label?: string;
};

export function SearchBar({ defaultValue = '', inputId, label = 'Search products' }: SearchBarProps) {
  return (
    <form action="/products" className="flex w-full items-center rounded-full border border-ink/10 bg-white p-1.5 shadow-[0_5px_18px_rgba(17,24,39,.045)] transition focus-within:border-violet/50 focus-within:shadow-[0_0_0_4px_rgba(121,87,255,.08)]">
      <label className="sr-only" htmlFor={inputId}>{label}</label>
      <Search aria-hidden="true" className="ml-3 shrink-0 text-ink/40" size={17} />
      <input
        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-ink outline-none placeholder:text-ink/35"
        defaultValue={defaultValue}
        id={inputId}
        name="q"
        placeholder="Search your next favorite"
        type="search"
      />
      <button aria-label="Search" className="grid size-9 shrink-0 place-items-center rounded-full bg-violet text-white transition hover:bg-ink" type="submit">
        <span className="sr-only">Search</span><span aria-hidden="true" className="text-xs font-bold">↵</span>
      </button>
    </form>
  );
}
