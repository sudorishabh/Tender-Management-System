"use client";
import { trpc } from "@/lib/trpc";
import React, { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/_components/ui/button";
import TenderCardSkeleton from "@/_components/Shared/skeleton/TenderCardSkeleton";
import TenderCard, { type VendorTenderLink } from "./TenderCard";
import PaginationComponent from "@/_components/Shared/Pagination";
import { useTenderContext } from "@/context/TenderContext";
import { useHomeFilterUrlSync } from "@/hooks/useHomeFilterUrlSync";

const HomeTenders = () => {
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
    setLatestPage,
    resetLatestPage,
    resetHomeTenderFilterOptions,
    setHomeTenderAvailability,
  } = useTenderContext();

  const loadTenderLimit = 20;
  const filtersRestored = useHomeFilterUrlSync();

  // Query for latest tenders
  const {
    data: latestData,
    isLoading: latestIsLoading,
    isFetching: latestIsFetching,
  } = trpc.tender.getHomeLatest.useQuery(
    {
      page: latestPage,
      limit: loadTenderLimit,
      search,
      department,
      location,
      budgetRange,
      sortBy,
      availability,
    },
    // Wait for filters in the URL so the unfiltered list never flashes first
    { enabled: filtersRestored }
  );

  const isListLoading = !filtersRestored || latestIsLoading;

  // Signed-in vendors see which listed tenders they bid on or were invited to
  const { data: session } = useSession();
  const { data: tenderLinks } = trpc.vendor.getMyTenderLinks.useQuery(
    undefined,
    { enabled: session?.user?.role === "vendor", staleTime: 60 * 1000 }
  );

  const vendorLinks = useMemo(() => {
    const links = new Map<number, VendorTenderLink>();
    tenderLinks?.invitedTenderIds.forEach((id) => links.set(id, "invited"));
    // A submitted bid is the more useful thing to know, so it wins
    tenderLinks?.biddedTenderIds.forEach((id) => links.set(id, "bid"));
    return links;
  }, [tenderLinks]);

  useEffect(() => {
    resetLatestPage();
  }, [
    availability,
    search,
    department,
    location,
    budgetRange,
    sortBy,
    resetLatestPage,
  ]);

  const handlePageChange = (page: number) => {
    setLatestPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters = Boolean(
    search || department || location || budgetRange
  );

  const tenders = latestData?.tenders ?? [];
  const totalPages = latestData?.totalPages ?? 1;
  const totalCount = latestData?.totalCount ?? 0;
  const hasTenders = tenders && tenders.length > 0;

  const rangeFrom = (latestPage - 1) * loadTenderLimit + 1;
  const rangeTo = Math.min(latestPage * loadTenderLimit, totalCount);

  const emptyMessage = (() => {
    if (hasActiveFilters) {
      return "No tenders match the filters you've applied. Try widening or clearing them.";
    }
    if (availability === "open") {
      return "No tenders are open for bidding right now. Please check back soon.";
    }
    if (availability === "closed") {
      return "No tenders have closed yet.";
    }
    return "There are no tenders published right now. Please check back soon.";
  })();

  return (
    <div>
      {!isListLoading && hasTenders && (
        <p
          className='mb-4 text-sm text-neutral-600'
          aria-live='polite'>
          Showing{" "}
          <span className='font-semibold text-neutral-900'>
            {rangeFrom}&ndash;{rangeTo}
          </span>{" "}
          of{" "}
          <span className='font-semibold text-neutral-900'>
            {totalCount}
          </span>{" "}
          {totalCount === 1 ? "tender" : "tenders"}
        </p>
      )}

      {isListLoading ? (
        <TenderCardSkeleton />
      ) : hasTenders ? (
        <div className='space-y-6'>
          {/* Dim the list while refetching so stale rows are never mistaken
              for the result of a filter that is still in flight. */}
          <div
            className={cn(
              "flex flex-col gap-6 pb-10 transition-opacity duration-200",
              latestIsFetching && "pointer-events-none opacity-50"
            )}
            aria-busy={latestIsFetching}>
            {tenders.map((tender) => (
              <TenderCard
                key={tender.tender_id}
                tender={tender}
                vendorLink={vendorLinks.get(tender.tender_id)}
              />
            ))}
          </div>

          <PaginationComponent
            currentPage={latestPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={latestIsFetching}
            className='py-8'
          />
        </div>
      ) : (
        <div className='flex flex-col mt-20 items-center justify-center text-center'>
          <div className='mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100'>
            <FileSearch
              className='h-5 w-5 text-gray-400'
              aria-hidden='true'
            />
          </div>
          <h3 className='text-lg font-semibold text-gray-800'>
            No tenders found
          </h3>
          <p className='mt-1 max-w-sm text-sm text-gray-500'>{emptyMessage}</p>
          {hasActiveFilters ? (
            <Button
              variant='outline'
              size='sm'
              onClick={resetHomeTenderFilterOptions}
              className='mt-4 text-xs'>
              Clear all filters
            </Button>
          ) : (
            availability === "open" && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => setHomeTenderAvailability("closed")}
                className='mt-4 text-xs'>
                View closed tenders
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default HomeTenders;
