"use client";
import React from "react";
import { cn } from "@/lib/utils";
import {
  useTenderContext,
  type TenderAvailability,
} from "@/context/TenderContext";

const TABS: { value: TenderAvailability; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "all", label: "All" },
];

/** Switches the home list between open, closed and all tenders. */
const HomeAvailabilityTabs = () => {
  const {
    tenderHomeFilter: { availability },
    setHomeTenderAvailability,
  } = useTenderContext();

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
          </button>
        );
      })}
    </div>
  );
};

export default HomeAvailabilityTabs;
