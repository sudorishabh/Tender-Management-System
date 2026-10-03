"use client";
import React, { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/_components/ui/input";
import { useTenderContext } from "@/context/TenderContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";

/**
 * Keyword search over the tender list.
 *
 * Keeps its own immediate value so typing stays responsive, and pushes the
 * debounced value into the shared filter that drives the query.
 */
const HomeSearchInput = () => {
  const {
    tenderHomeFilter: { search },
    setHomeTenderSearch,
  } = useTenderContext();

  const [value, setValue] = useState(search);
  const debounced = useDebouncedValue(value, 350);

  // The search both fields agree on, so neither side echoes the other back
  const syncedSearch = useRef(search);

  useEffect(() => {
    if (debounced === syncedSearch.current) return;
    syncedSearch.current = debounced;
    setHomeTenderSearch(debounced);
  }, [debounced, setHomeTenderSearch]);

  // Reflect outside changes (a search restored from the URL, or
  // "Clear all filters") back into the field
  useEffect(() => {
    if (search === syncedSearch.current) return;
    syncedSearch.current = search;
    setValue(search);
  }, [search]);

  return (
    <div className='relative min-w-0 flex-1'>
      <Search
        className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400'
        aria-hidden='true'
      />
      <Input
        type='search'
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder='Search tenders by title, department or location'
        aria-label='Search tenders'
        className={cn(
          "h-10 w-full truncate rounded-lg border-slate-300 bg-white pl-9 pr-9 text-sm shadow-sm transition-colors placeholder:text-slate-500 hover:border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
          value && "border-primary"
        )}
      />
      {value && (
        <button
          type='button'
          onClick={() => setValue("")}
          aria-label='Clear search'
          className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700'>
          <X
            className='size-3.5'
            aria-hidden='true'
          />
        </button>
      )}
    </div>
  );
};

export default HomeSearchInput;
