import React from "react";
import { Check, HelpCircle } from "lucide-react";
import { ITender } from "@/_types/tender";
import { cn } from "@/lib/utils";
import {
  formatDisplayDateWithWeekday,
  formatDisplayTime12,
  getDaysUntil,
} from "@/utils/dateUtils";
import { normalizeDbDate } from "@/utils/normalizeDbDate";

interface TenderTimelineProps {
  tender: ITender;
}

// Dates that should show time
const datesWithTime = [
  "tender_technical_bid_opening",
  "tender_financial_bid_opening",
  "tender_bid_submission_deadline",
];

// Query-related event keys
const queryRelatedEvents = ["tender_query_deadline", "tender_query_response_date"];

const DEADLINE_KEY = "tender_bid_submission_deadline";

const shouldShowTime = (eventKey: string) => datesWithTime.includes(eventKey);

/** Timed events pass at their hour; date-only ones once the day is over. */
const hasPassed = (eventKey: string, date: string | Date | null) => {
  if (!date) return false;
  if (shouldShowTime(eventKey)) {
    const at = normalizeDbDate(date);
    return Boolean(at) && at!.getTime() < Date.now();
  }
  const daysLeft = getDaysUntil(date);
  return daysLeft !== null && daysLeft < 0;
};

const TenderTimeline: React.FC<TenderTimelineProps> = ({ tender }) => {
  const timelineEvents = [
    {
      label: "Tender Release Date",
      description: "Date when tender was published and made available",
      date: tender.tender_release_date,
      key: "tender_release_date",
    },
    {
      label: "Query Submission Deadline",
      description: "Last date to submit clarification queries",
      date: tender.tender_query_deadline,
      key: "tender_query_deadline",
    },
    {
      label: "Query Response Date",
      description: "Date when responses to queries will be published",
      date: tender.tender_query_response_date,
      key: "tender_query_response_date",
    },
    {
      label: "Bid Submission Deadline",
      description: "Final date and time to submit your bid",
      date: tender.tender_bid_submission_deadline,
      key: DEADLINE_KEY,
    },
    {
      label: "Technical Bid Opening",
      description: "Date and time when technical bids will be opened",
      date: tender.tender_technical_bid_opening,
      key: "tender_technical_bid_opening",
    },
    {
      label: "Financial Bid Opening",
      description: "Date and time when financial bids will be opened",
      date: tender.tender_financial_bid_opening,
      key: "tender_financial_bid_opening",
    },
  ].map((event) => ({ ...event, isPast: hasPassed(event.key, event.date) }));

  // The first dated event still ahead is what bidders should watch for
  const nextKey = timelineEvents.find((event) => event.date && !event.isPast)
    ?.key;

  return (
    <div className='bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden'>
      <div className='px-5 py-4 border-b border-neutral-100'>
        <h2 className='text-sm font-semibold text-slate-900'>
          Timeline & Key Dates
        </h2>
        <p className='text-xs text-slate-600 mt-1'>
          Important dates and deadlines for this tender
        </p>
      </div>

      <div className='p-5'>
        {/* Query Information Box */}
        {(tender.tender_query_deadline ||
          tender.tender_query_response_date) && (
          <div className='mb-6 flex gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4'>
            <HelpCircle
              className='mt-0.5 size-4 shrink-0 text-sky-700'
              aria-hidden='true'
            />
            <div className='space-y-1.5 text-xs leading-relaxed text-sky-900'>
              <h3 className='text-sm font-semibold'>
                Query Submission Process
              </h3>
              <p>
                <span className='font-semibold'>Query Submission Period:</span>{" "}
                You can submit clarification queries only{" "}
                <span className='font-bold'>
                  before{" "}
                  {tender.tender_query_deadline
                    ? formatDisplayDateWithWeekday(tender.tender_query_deadline)
                    : "the query deadline"}
                </span>
                .
              </p>
              <p>
                <span className='font-semibold'>Response Timeline:</span> All
                answers to submitted queries will be published{" "}
                <span className='font-bold'>
                  on or before{" "}
                  {tender.tender_query_response_date
                    ? formatDisplayDateWithWeekday(
                        tender.tender_query_response_date,
                      )
                    : "the response date"}
                </span>
                .
              </p>
              <p>
                <span className='font-semibold'>Important:</span> Queries
                submitted after the deadline will not be entertained. Plan
                accordingly to receive timely clarifications.
              </p>
            </div>
          </div>
        )}

        <ol>
          {timelineEvents.map((event) => {
            const isNext = event.key === nextKey;
            const isDeadline = event.key === DEADLINE_KEY;

            return (
              <li
                key={event.key}
                className='group relative flex gap-4 pb-6 last:pb-0'>
                {/* Rail joining this step to the next */}
                <span
                  aria-hidden
                  className='absolute bottom-0 left-3 top-7 w-px -translate-x-1/2 bg-slate-200 group-last:hidden'
                />
                <span
                  aria-hidden
                  className={cn(
                    "relative mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                    event.isPast
                      ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/20"
                      : isNext
                        ? "bg-primary ring-4 ring-primary/15"
                        : "bg-white ring-1 ring-slate-300",
                  )}>
                  {event.isPast ? (
                    <Check className='size-3.5' />
                  ) : (
                    isNext && <span className='size-2 rounded-full bg-white' />
                  )}
                </span>

                <div className='flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <h3
                        className={cn(
                          "text-sm text-slate-900",
                          isDeadline ? "font-semibold" : "font-medium",
                        )}>
                        {event.label}
                      </h3>
                      {queryRelatedEvents.includes(event.key) && (
                        <span className='rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700 ring-1 ring-inset ring-sky-600/20'>
                          Query
                        </span>
                      )}
                      {isNext && (
                        <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary'>
                          Next
                        </span>
                      )}
                    </div>
                    <p className='mt-0.5 text-xs leading-relaxed text-slate-500'>
                      {event.description}
                    </p>
                  </div>

                  <div className='shrink-0 sm:text-right'>
                    {event.date ? (
                      <>
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            event.isPast
                              ? "text-slate-500"
                              : isDeadline
                                ? "text-primary"
                                : "text-slate-900",
                          )}>
                          {formatDisplayDateWithWeekday(event.date)}
                        </p>
                        {shouldShowTime(event.key) && (
                          <p className='text-xs text-slate-600 font-medium'>
                            {formatDisplayTime12(event.date)}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className='text-sm font-semibold text-neutral-400'>
                        TBD
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Venue and Project Duration */}
        {(tender.tender_opening_venue || tender.tender_project_duration) && (
          <div
            className={`grid gap-3 mt-6 pt-5 border-t border-neutral-100 ${
              tender.tender_opening_venue && tender.tender_project_duration
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1"
            }`}>
            {tender.tender_opening_venue && (
              <div className='p-3.5 rounded-lg bg-slate-50 border border-slate-200'>
                <h3 className='text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2'>
                  Opening Venue
                </h3>
                <p className='text-sm text-slate-700 leading-relaxed mb-1'>
                  {tender.tender_opening_venue}
                </p>
                <p className='text-xs text-slate-600'>
                  Authorized bidders or their representatives may attend the bid
                  opening at this venue
                </p>
              </div>
            )}
            {tender.tender_project_duration && (
              <div className='p-3.5 rounded-lg bg-slate-50 border border-slate-200'>
                <h3 className='text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2'>
                  Project Duration
                </h3>
                <p className='text-sm text-slate-900 font-semibold mb-1'>
                  {tender.tender_project_duration}
                </p>
                <p className='text-xs text-slate-600'>
                  Timeline from contract award to final project completion and
                  handover
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenderTimeline;
