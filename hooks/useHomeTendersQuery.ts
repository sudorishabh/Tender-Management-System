"use client";
import { trpc } from "@/lib/trpc";
import { useTenderContext } from "@/context/TenderContext";

export const HOME_TENDERS_PAGE_SIZE = 20;

/**
 * The home tender list query, built from the shared filters.
 *
 * Every caller with the same filters shares one cached request, so a
 * component can read the list or its counts with `enabled: false` and never
 * trigger a second fetch.
 */
export function useHomeTendersQuery({ enabled }: { enabled: boolean }) {
  const {
    tenderHomeFilter: {
      availability,
      search,
      department,
      location,
      budgetRange,
      sortBy,
    },
    homePagination: { latestPage },
  } = useTenderContext();

  return trpc.tender.getHomeLatest.useQuery(
    {
      page: latestPage,
      limit: HOME_TENDERS_PAGE_SIZE,
      search,
      department,
      location,
      budgetRange,
      sortBy,
      availability,
    },
    { enabled }
  );
}

export default useHomeTendersQuery;
