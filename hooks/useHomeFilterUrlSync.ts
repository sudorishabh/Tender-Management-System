"use client";
import { useEffect, useState } from "react";
import {
  useTenderContext,
  type TenderAvailability,
} from "@/context/TenderContext";

const AVAILABILITIES: TenderAvailability[] = ["open", "closed", "all"];

const isAvailability = (value: string | null): value is TenderAvailability =>
  AVAILABILITIES.includes(value as TenderAvailability);

/**
 * Keeps the home tender filters in the address bar, so a reload or the back
 * button keeps them and a filtered list can be shared as a link.
 *
 * Returns false until the filters in the URL have been applied, so the list
 * can hold its first fetch instead of loading the unfiltered list first.
 */
export function useHomeFilterUrlSync() {
  const {
    tenderHomeFilter: {
      availability,
      search,
      department,
      location,
      budgetRange,
      sortBy,
    },
    setHomeTenderAvailability,
    setHomeTenderSearch,
    setHomeTenderDepartment,
    setHomeTenderLocation,
    setHomeTenderBudgetRange,
    setHomeTenderSortBy,
  } = useTenderContext();

  const [isRestored, setIsRestored] = useState(false);

  // Apply the filters from the URL once, on first load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const show = params.get("show");
    if (isAvailability(show)) setHomeTenderAvailability(show);

    const textFilters: [string, (value: string) => void][] = [
      ["q", setHomeTenderSearch],
      ["department", setHomeTenderDepartment],
      ["location", setHomeTenderLocation],
      ["budget", setHomeTenderBudgetRange],
      ["sort", setHomeTenderSortBy],
    ];
    textFilters.forEach(([key, setFilter]) => {
      const value = params.get(key);
      if (value) setFilter(value);
    });

    setIsRestored(true);
  }, [
    setHomeTenderAvailability,
    setHomeTenderSearch,
    setHomeTenderDepartment,
    setHomeTenderLocation,
    setHomeTenderBudgetRange,
    setHomeTenderSortBy,
  ]);

  // Mirror every change back into the URL, leaving defaults out
  useEffect(() => {
    if (!isRestored) return;

    const params = new URLSearchParams();
    if (availability !== "all") params.set("show", availability);
    if (search) params.set("q", search);
    if (department) params.set("department", department);
    if (location) params.set("location", location);
    if (budgetRange) params.set("budget", budgetRange);
    if (sortBy) params.set("sort", sortBy);

    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ""}`;

    // replaceState: filter tweaks shouldn't each add a back-button step
    if (url !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", url);
    }
  }, [
    isRestored,
    availability,
    search,
    department,
    location,
    budgetRange,
    sortBy,
  ]);

  return isRestored;
}

export default useHomeFilterUrlSync;
