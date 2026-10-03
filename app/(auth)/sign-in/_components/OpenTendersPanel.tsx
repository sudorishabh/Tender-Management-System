"use client";
import React from "react";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { bidSteps } from "@/lib/bid-steps";
import { cn } from "@/lib/utils";
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

type PanelTender = {
  tender_id: number;
  tender_title: string | null;
  tender_number: string | null;
  tender_bid_end_date: Date | string | null;
};

/**
 * One tender as a notice board entry: a date tile for the bid deadline, then
 * its reference number and title. Closed tenders are dimmed.
 */
const TenderRow = ({
  tender,
  isClosed,
}: {
  tender: PanelTender;
  isClosed: boolean;
}) => (
  <li className='border-b border-white/10'>
    <Link
      href={`/tender/${tender.tender_id}`}
      className='group -mx-3 flex gap-4 rounded-md px-3 py-4 transition-colors hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-accent'>
      <span
        aria-hidden='true'
        className={cn(
          "flex w-12 shrink-0 flex-col items-center self-start rounded-md border py-1.5 leading-none",
          isClosed
            ? "border-white/10 text-navy-foreground/70"
            : "border-navy-accent/30 bg-navy-accent/10 text-white"
        )}>
        <span className='text-lg font-semibold tabular-nums'>
          {formatDisplayDate(tender.tender_bid_end_date, { day: "numeric" })}
        </span>
        <span className='mt-1 text-[0.6875rem] font-medium'>
          {formatDisplayDate(tender.tender_bid_end_date, { month: "short" })}
        </span>
      </span>

      <span className='min-w-0 flex-1'>
        <span className='flex items-center justify-between gap-3 text-xs'>
          <span className='truncate tabular-nums'>
            {tender.tender_number}
          </span>
          {isClosed ? (
            <span className='shrink-0 text-navy-foreground/70'>Closed</span>
          ) : (
            <DateCountdown
              date={tender.tender_bid_end_date}
              tone='dark'
            />
          )}
        </span>
        <span
          className={cn(
            "mt-1 line-clamp-2 text-[0.9375rem] font-medium leading-snug underline-offset-2 group-hover:underline",
            isClosed ? "text-white/75" : "text-white"
          )}>
          {capitalizeFirstLetter(tender.tender_title) || "Untitled tender"}
        </span>
        <span className='sr-only'>
          {isClosed ? "Closed" : "Closes"}{" "}
          {formatDisplayDate(tender.tender_bid_end_date)}
        </span>
      </span>
    </Link>
  </li>
);

const ListSkeleton = () => (
  <ul
    aria-hidden='true'
    className='mt-8 border-t border-white/10'>
    {Array.from({ length: SHOWN_LIMIT }, (_, index) => (
      <li
        key={index}
        className='flex gap-4 border-b border-white/10 py-4'>
        <div className='h-12 w-12 shrink-0 animate-pulse rounded-md bg-white/10' />
        <div className='flex-1 space-y-2.5 pt-1'>
          <div className='h-3 w-28 animate-pulse rounded bg-white/10' />
          <div className='h-4 w-4/5 animate-pulse rounded bg-white/10' />
        </div>
      </li>
    ))}
  </ul>
);

// Tenders without a deadline can't show a date tile, and never close soon
const withDeadlines = (tenders: PanelTender[] | undefined) =>
  tenders?.filter((tender) => tender.tender_bid_end_date).slice(0, SHOWN_LIMIT) ??
  [];

/**
 * Navy panel beside the sign-in form on wide screens: the open tenders that
 * close soonest, or the latest closed ones when none are open, and the
 * bidding steps for anyone who hasn't registered yet.
 */
const OpenTendersPanel = () => {
  const openQuery = trpc.tender.getHomeLatest.useQuery(CLOSING_SOON_QUERY, {
    staleTime: 5 * 60 * 1000,
  });
  const openTenders = withDeadlines(openQuery.data?.tenders);
  const hasNoneOpen = !openQuery.isLoading && openTenders.length === 0;

  // Only asked for when nothing is open, so the panel still shows real
  // tenders instead of a lone "nothing here" line
  const closedQuery = trpc.tender.getHomeLatest.useQuery(
    { ...CLOSING_SOON_QUERY, availability: "closed" },
    { enabled: hasNoneOpen, staleTime: 5 * 60 * 1000 }
  );
  const closedTenders = withDeadlines(closedQuery.data?.tenders);

  return (
    <aside
      aria-labelledby='open-tenders-heading'
      className='hidden bg-navy text-navy-foreground lg:order-first lg:block'>
      <div className='ml-auto flex h-full max-w-xl flex-col px-12 pb-12 pt-[12vh] xl:px-16'>
        <h2
          id='open-tenders-heading'
          className='text-2xl font-semibold tracking-tight text-white'>
          Open for bids
        </h2>
        <p className='mt-2 max-w-sm text-sm leading-relaxed'>
          Sign in to buy tender documents and submit your bid before the
          deadline.
        </p>

        {openQuery.isLoading ? (
          <ListSkeleton />
        ) : openTenders.length > 0 ? (
          <ul className='mt-8 border-t border-white/10'>
            {openTenders.map((tender) => (
              <TenderRow
                key={tender.tender_id}
                tender={tender}
                isClosed={false}
              />
            ))}
          </ul>
        ) : (
          <>
            <div className='mt-6 flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4'>
              <CalendarClock
                className='mt-0.5 size-5 shrink-0 text-navy-accent'
                aria-hidden='true'
              />
              <div>
                <p className='text-sm font-medium text-white'>
                  No tenders are open right now
                </p>
                <p className='mt-0.5 text-sm leading-relaxed'>
                  New tenders appear here as TERI releases them.
                </p>
              </div>
            </div>

            {closedQuery.isLoading ? (
              <ListSkeleton />
            ) : (
              closedTenders.length > 0 && (
                <>
                  <h3 className='mt-6 text-sm font-semibold text-white'>
                    Recently closed
                  </h3>
                  <ul className='mt-2 border-t border-white/10'>
                    {closedTenders.map((tender) => (
                      <TenderRow
                        key={tender.tender_id}
                        tender={tender}
                        isClosed
                      />
                    ))}
                  </ul>
                </>
              )
            )}
          </>
        )}

        <Link
          href='/'
          className='mt-6 self-start rounded-sm text-sm font-medium text-navy-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-accent'>
          Browse all tenders
        </Link>

        {/* Pinned to the foot of the panel, and only on screens tall enough
            to fit it below the list without scrolling */}
        <section
          aria-labelledby='bid-steps-heading'
          className='mt-auto hidden pt-12 [@media(min-height:900px)]:block'>
          <h3
            id='bid-steps-heading'
            className='text-sm font-semibold text-white'>
            How bidding works
          </h3>
          <ol className='mt-4 grid grid-cols-4 gap-3'>
            {bidSteps.map((step, index) => (
              <li key={step.title}>
                <div className='flex items-center gap-2'>
                  <span
                    aria-hidden='true'
                    className='flex size-7 shrink-0 items-center justify-center rounded-full border border-navy-accent/40 text-xs font-semibold tabular-nums text-navy-accent'>
                    {index + 1}
                  </span>
                  {index < bidSteps.length - 1 && (
                    <span
                      aria-hidden='true'
                      className='h-px flex-1 bg-white/15'
                    />
                  )}
                </div>
                <p className='mt-2 pr-2 text-xs font-medium leading-snug text-white'>
                  {step.title}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </aside>
  );
};

export default OpenTendersPanel;
