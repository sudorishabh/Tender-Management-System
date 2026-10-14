"use client";
import { useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/routers";
import { trpc } from "@/lib/trpc";
import { useTenderContext } from "@/context/TenderContext";
import { HOME_TENDERS_PAGE_SIZE } from "@/lib/constants";

export { HOME_TENDERS_PAGE_SIZE };

export type HomeTendersResult =
  inferRouterOutputs<AppRouter>["tender"]["getHomeLatest"];

/**
 * The home tender list query, built from the shared filters.
 *
 * Every caller with the same filters shares one cached request, so a
 * component can read the list or its counts with `enabled: false` and never
 * trigger a second fetch.
 *
 * `initialData` is the list the server rendered. Only pass it for the query
 * it was loaded with - the unfiltered first page.
 */
export function useHomeTendersQuery({
  enabled,
  initialData,
}: {
  enabled: boolean;
  initialData?: HomeTendersResult;
}) {
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

  // When the server's list arrived, so a query rebuilt from it later (after
  // the cache dropped it) counts as stale and refetches
  const [initialDataUpdatedAt] = useState(Date.now);

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
    {
      enabled,
      initialData,
      initialDataUpdatedAt,
      // Keeps the server's list from being refetched the moment it hydrates
      ...(initialData && { staleTime: 60 * 1000 }),
    }
  );
}

export default useHomeTendersQuery;
