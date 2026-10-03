"use client";
import React, { useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { Badge } from "@/_components/ui/badge";
import { cn } from "@/lib/utils";
import { useTenderContext } from "@/context/TenderContext";
import HomeSortSection from "./TenderActionBarComp/HomeSortSection";
import HomeMobileFilterPanel from "./TenderActionBarComp/HomeMobileFilterPanel";
import HomeDesktopFilterPanel from "./TenderActionBarComp/HomeDesktopFilterPanel";
import HomeSearchInput from "./TenderActionBarComp/HomeSearchInput";
import HomeAvailabilityTabs from "../HomeAvailabilityTabs";

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

  const activeFiltersCount = [search, department, location, budgetRange].filter(
    Boolean
  ).length;

  const clearAllFilters = () => {
    setHomeTenderSearch("");
    setHomeTenderDepartment("");
    setHomeTenderLocation("");
    setHomeTenderBudgetRange("");
    setHomeTenderSortBy("");
  };

  const getBudgetRangeLabel = (value: string) => {
    switch (value) {
      case "low":
        return "< ₹10L";
      case "mid":
        return "₹10-50L";
      case "high":
        return "> ₹50L";
      default:
        return "Any";
    }
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

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className=' flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 hidden md:flex'>
              <span className='text-sm text-gray-500'>Active filters:</span>
              <div className='flex flex-wrap gap-1'>
                {search && (
                  <Badge
                    variant='secondary'
                    className='text-xs flex items-center gap-1'>
                    Search: {search}
                    <X
                      className='h-3 w-3 cursor-pointer hover:text-red-500'
                      onClick={() => setHomeTenderSearch("")}
                    />
                  </Badge>
                )}
                {department && (
                  <Badge
                    variant='secondary'
                    className='text-xs flex items-center gap-1'>
                    Department: {department}
                    <X
                      className='h-3 w-3 cursor-pointer hover:text-red-500'
                      onClick={() => setHomeTenderDepartment("")}
                    />
                  </Badge>
                )}
                {location && (
                  <Badge
                    variant='secondary'
                    className='text-xs flex items-center gap-1'>
                    Location: {location}
                    <X
                      className='h-3 w-3 cursor-pointer hover:text-red-500'
                      onClick={() => setHomeTenderLocation("")}
                    />
                  </Badge>
                )}
                {budgetRange && (
                  <Badge
                    variant='secondary'
                    className='text-xs flex items-center gap-1'>
                    Fee + EMD: {getBudgetRangeLabel(budgetRange)}
                    <X
                      className='h-3 w-3 cursor-pointer hover:text-red-500'
                      onClick={() => setHomeTenderBudgetRange("")}
                    />
                  </Badge>
                )}
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={clearAllFilters}
                className='text-xs text-gray-500 hover:text-gray-700 self-start sm:self-auto'>
                Clear All
              </Button>
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
