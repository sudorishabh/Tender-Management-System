"use client";
import React from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import DateCountdown from "@/app/(dashboards)/vendor/_components/DateCountdown";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { formatDisplayDate } from "@/utils/dateUtils";

// Same input as the home "Closing soon" card, so arriving from the home page
// reuses its cached result instead of querying again
const CLOSING_SOON_QUERY = {
  page: 1,
  limit: 5,
  availability: "open",
  sortBy: "deadline-soon",
} as const;

// Three fit beside the form on a 1280x800 laptop screen without scrolling
const SHOWN_LIMIT = 3;

/**
 * Navy panel beside the sign-in form on wide screens, listing the open
 * tenders that close soonest: the bids waiting on the other side of signing in.
 */
const OpenTendersPanel = () => {
  const { data, isLoading } = trpc.tender.getHomeLatest.useQuery(
    CLOSING_SOON_QUERY,
    { staleTime: 5 * 60 * 1000 }
  );

  // Open tenders without a deadline sort last, and never close soon
  const tenders =
    data?.tenders
      .filter((tender) => tender.tender_bid_end_date)
      .slice(0, SHOWN_LIMIT) ?? [];

  return (
    <aside
      aria-labelledby='open-tenders-heading'
      className='hidden bg-sidebar text-sidebar-foreground lg:order-first lg:block'>
      <div className='ml-auto max-w-xl px-12 pb-12 pt-[12vh] xl:px-16'>
        <h2
          id='open-tenders-heading'
          className='text-2xl font-semibold tracking-tight text-white'>
          Open for bids
        </h2>
        <p className='mt-2 max-w-sm text-sm leading-relaxed'>
          Sign in to buy tender documents and submit your bid before the
          deadline.
        </p>

        {isLoading ? (
          <ul
            aria-hidden='true'
            className='mt-8 border-t border-white/10'>
            {Array.from({ length: SHOWN_LIMIT }, (_, index) => (
              <li
                key={index}
                className='space-y-2.5 border-b border-white/10 py-4'>
                <div className='h-3 w-24 animate-pulse rounded bg-white/10' />
                <div className='h-4 w-4/5 animate-pulse rounded bg-white/10' />
                <div className='h-3 w-32 animate-pulse rounded bg-white/10' />
              </li>
            ))}
          </ul>
        ) : tenders.length > 0 ? (
          <ul className='mt-8 border-t border-white/10'>
            {tenders.map((tender) => (
              <li
                key={tender.tender_id}
                className='border-b border-white/10'>
                <Link
                  href={`/tender/${tender.tender_id}`}
                  className='group -mx-3 block rounded-md px-3 py-4 transition-colors hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring'>
                  {tender.tender_number && (
                    <p className='truncate text-xs tabular-nums'>
                      {tender.tender_number}
                    </p>
                  )}
                  <p className='mt-1 line-clamp-2 text-[0.9375rem] font-medium leading-snug text-white underline-offset-2 group-hover:underline'>
                    {capitalizeFirstLetter(tender.tender_title) ||
                      "Untitled tender"}
                  </p>
                  <div className='mt-2 flex items-center justify-between gap-4 text-xs'>
                    <span className='tabular-nums'>
                      Closes {formatDisplayDate(tender.tender_bid_end_date)}
                    </span>
                    <DateCountdown
                      date={tender.tender_bid_end_date}
                      tone='dark'
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className='mt-8 border-t border-white/10 pt-6 text-sm leading-relaxed'>
            No tenders are open for bids right now. New tenders appear on the
            home page as TERI releases them.
          </p>
        )}

        <Link
          href='/'
          className='mt-6 inline-block rounded-sm text-sm font-medium text-sidebar-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring'>
          Browse all tenders
        </Link>
      </div>
    </aside>
  );
};

export default OpenTendersPanel;
