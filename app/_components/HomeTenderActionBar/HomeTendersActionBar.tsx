"use client";
import React, { useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { cn } from "@/lib/utils";
import { useTenderContext } from "@/context/TenderContext";
import HomeSortSection from "./TenderActionBarComp/HomeSortSection";
import HomeMobileFilterPanel from "./TenderActionBarComp/HomeMobileFilterPanel";
import HomeDesktopFilterPanel from "./TenderActionBarComp/HomeDesktopFilterPanel";
import HomeSearchInput from "./TenderActionBarComp/HomeSearchInput";
import HomeAvailabilityTabs from "../HomeAvailabilityTabs";

const getBudgetRangeLabel = (value: string) => {
  switch (value) {
    case "low":
      return "Under ₹10L";
    case "mid":
      return "₹10–50L";
    case "high":
      return "Above ₹50L";
    default:
      return "Any";
  }
};

const HomeTendersActionBar = () => {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const {
    tenderHomeFilter: { search, department, location, budgetRange, sortBy },
    setHomeTenderSearch,
    setHomeTenderDepartment,
    setHomeTenderLocation,
    setHomeTenderBudgetRange,
    setHomeTenderSortBy,
  } = useTenderContext();

  // One chip per applied filter, each removable on its own
  const activeFilters = [
    { label: "Search", value: search, clear: () => setHomeTenderSearch("") },
    {
      label: "Department",
      value: department,
      clear: () => setHomeTenderDepartment(""),
    },
    {
      label: "Location",
      value: location,
      clear: () => setHomeTenderLocation(""),
    },
    {
      label: "Fee + EMD",
      value: budgetRange && getBudgetRangeLabel(budgetRange),
      clear: () => setHomeTenderBudgetRange(""),
    },
  ].filter((filter) => filter.value);

  const activeFiltersCount = activeFilters.length;

  const clearAllFilters = () => {
    setHomeTenderSearch("");
    setHomeTenderDepartment("");
    setHomeTenderLocation("");
    setHomeTenderBudgetRange("");
    setHomeTenderSortBy("");
  };

  return (
    <div className='sticky top-12 md:top-14 z-10 mb-4 border-b border-gray-300 bg-canvas/95 backdrop-blur-sm'>
      {/* No bottom padding: the tab underline sits on the bar's border */}
      <div className='pt-2'>
        {/* Main Filter Bar */}
        <div className='flex flex-col gap-3'>
          {/* Below lg the filters fold behind a button beside the search */}
          <div className='flex items-center gap-2'>
            <HomeSearchInput />
            {/* Same height and border as the search box it sits beside */}
            <Button
              variant='outline'
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              aria-expanded={isMobileFiltersOpen}
              className={cn(
                "h-10 shrink-0 gap-2 rounded-lg border-slate-300 bg-white px-3 font-normal text-slate-700 hover:border-primary/50 hover:bg-white lg:hidden",
                isMobileFiltersOpen && "border-primary bg-primary/5"
              )}>
              <SlidersHorizontal
                className='text-primary'
                aria-hidden='true'
              />
              Filters
              {activeFiltersCount > 0 && (
                <span className='rounded-full bg-primary px-1.5 text-xs font-semibold tabular-nums text-white'>
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>

          <HomeDesktopFilterPanel
            department={department}
            location={location}
            budgetRange={budgetRange}
          />

          {isMobileFiltersOpen && (
            <HomeMobileFilterPanel
              department={department}
              location={location}
              budgetRange={budgetRange}
              sortBy={sortBy}
              clearAllFilters={clearAllFilters}
              setIsMobileFiltersOpen={setIsMobileFiltersOpen}
            />
          )}

          {/* Shown at every width: below lg it's the only sign of what the
              folded-away filters are set to */}
          {activeFiltersCount > 0 && (
            <div className='flex flex-wrap items-center gap-2'>
              <span className='text-xs text-slate-500'>Active filters:</span>
              {activeFilters.map((filter) => (
                <span
                  key={filter.label}
                  className='inline-flex max-w-full items-center gap-1 rounded-full border border-primary/20 bg-primary/5 py-0.5 pl-2.5 pr-1 text-xs text-slate-600'>
                  <span className='min-w-0 truncate'>
                    {filter.label}:{" "}
                    <span className='font-medium text-slate-900'>
                      {filter.value}
                    </span>
                  </span>
                  <button
                    type='button'
                    onClick={filter.clear}
                    aria-label={`Remove ${filter.label} filter`}
                    className='shrink-0 rounded-full p-0.5 text-slate-500 transition-colors hover:bg-primary/10 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'>
                    <X
                      className='size-3'
                      aria-hidden='true'
                    />
                  </button>
                </span>
              ))}
              <button
                type='button'
                onClick={clearAllFilters}
                className='rounded text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'>
                Clear all
              </button>
            </div>
          )}

          {/* Sort orders the list the tabs pick, so the two share a row */}
          <div className='flex items-end justify-between gap-4'>
            <HomeAvailabilityTabs />
            <HomeSortSection sortBy={sortBy} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTendersActionBar;
