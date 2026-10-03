"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  useTenderContext,
  type TenderAvailability,
} from "@/context/TenderContext";
import { useHomeTendersQuery } from "@/hooks/useHomeTendersQuery";

const TABS: { value: TenderAvailability; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
];

/** Switches the home list between open, closed and all tenders. */
const HomeAvailabilityTabs = () => {
  const {
    tenderHomeFilter: { availability },
    setHomeTenderAvailability,
  } = useTenderContext();

  // Reads the list's cached result - HomeTenders owns the fetch
  const { data } = useHomeTendersQuery({ enabled: false });

  // Hold the last counts while new filters load, so the numbers don't blink
  const [counts, setCounts] = useState<Record<TenderAvailability, number>>();
  useEffect(() => {
    if (data?.availabilityCounts) setCounts(data.availabilityCounts);
  }, [data]);

  return (
    <div
      role='group'
      aria-label='Show tenders'
      className='flex items-center gap-5'>
      {TABS.map((tab) => {
        const isActive = availability === tab.value;
        return (
          <button
            key={tab.value}
            type='button'
            aria-pressed={isActive}
            onClick={() => setHomeTenderAvailability(tab.value)}
            className={cn(
              "-mb-px border-b-2 pb-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            )}>
            {tab.label}
            {counts && (
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-slate-200/70 text-slate-600"
                )}>
                {counts[tab.value]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default HomeAvailabilityTabs;
