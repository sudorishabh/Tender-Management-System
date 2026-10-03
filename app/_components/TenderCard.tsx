"use client";
import React, { FC, useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  FileText,
  CreditCard,
  Tag,
  ArrowRight,
  CalendarClock,
  IndianRupee,
  CircleCheck,
  MailOpen,
} from "lucide-react";
import { formatDisplayDate, getDaysUntil } from "@/utils/dateUtils";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { ITenderCard } from "@/_types/tender/index";
import { cn } from "@/lib/utils";
import { abbreviateIndian } from "@/utils/abbreviateIndianCurrency";

/** Urgency tone for the deadline pill. Tighter window = louder colour. */
const getDeadlineTone = (days: number) => {
  if (days <= 2) return "bg-red-50 text-red-700 border-red-200";
  if (days <= 7) return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-neutral-50 text-neutral-600 border-neutral-300";
};

const getDeadlineLabel = (days: number) => {
  if (days === 0) return "Closes today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
};

/**
 * Many tenders reuse the description's opening as the title, so the card
 * would print the same sentence twice. Returns the rest of the description,
 * resuming at the word the title stops in, or null when nothing new remains.
 */
const getDescriptionPreview = (title: string, description: string) => {
  const collapse = (text: string) => text.replace(/\s+/g, " ").trim();
  const heading = collapse(title);
  const body = collapse(description);

  if (!heading || !body.toLowerCase().startsWith(heading.toLowerCase())) {
    return body;
  }

  // Back up to the start of a word the title cut through ("requir|ement")
  const cutsWord =
    /\w/.test(heading[heading.length - 1]) &&
    /\w/.test(body[heading.length] ?? "");
  const resumeAt = cutsWord ? heading.lastIndexOf(" ") + 1 : heading.length;
  const rest = body.slice(resumeAt).replace(/^[\s,.;:–-]+/, "");

  return rest ? `…${rest}` : null;
};

/** How the signed-in vendor is connected to a tender */
export type VendorTenderLink = "bid" | "invited";

const vendorLinkBadges = {
  bid: {
    icon: CircleCheck,
    label: "Bid submitted",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  invited: {
    icon: MailOpen,
    label: "Invited",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
} satisfies Record<VendorTenderLink, object>;

const VendorLinkBadge: FC<{ link: VendorTenderLink }> = ({ link }) => {
  const { icon: Icon, label, className } = vendorLinkBadges[link];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
        className
      )}>
      <Icon
        className='size-3'
        aria-hidden='true'
      />
      {label}
    </span>
  );
};

/** Low-emphasis inline attribute (department / location / scope). */
const MetaChip: FC<{
  icon: React.ElementType;
  label: string;
  value?: string | null;
}> = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <span
      className='inline-flex min-w-0 items-center gap-1 text-xs text-neutral-600'
      title={`${label}: ${value}`}>
      <Icon
        className='size-3 shrink-0 text-neutral-400'
        aria-hidden='true'
      />
      <span className='sr-only'>{label}: </span>
      <span className='truncate'>{capitalizeFirstLetter(value)}</span>
    </span>
  );
};

/** A money figure in the footer strip. */
const MoneyStat: FC<{
  icon: React.ElementType;
  label: string;
  amount?: string | null;
}> = ({ icon: Icon, label, amount }) => (
  <div className='flex min-w-0 items-center gap-1.5'>
    <Icon
      className='size-3.5 shrink-0 text-neutral-400'
      aria-hidden='true'
    />
    <span className='text-xs text-neutral-500'>{label}</span>
    {amount === null || amount === undefined || amount === "" ? (
      <span className='text-xs font-semibold text-neutral-400'>N/A</span>
    ) : (
      <span className='flex items-baseline text-xs font-semibold text-neutral-900'>
        <IndianRupee
          className='size-2.5 shrink-0'
          aria-hidden='true'
        />
        {abbreviateIndian(Number(amount))}
      </span>
    )}
  </div>
);

const TenderCard: FC<{
  tender: ITenderCard;
  /** Set for signed-in vendors who have bid on or been invited to it */
  vendorLink?: VendorTenderLink;
}> = ({ tender, vendorLink }) => {
  // Computed after mount only: the server may run in a different timezone than
  // the visitor, so a countdown rendered during SSR can disagree with the
  // client and trip a hydration mismatch. The absolute date in the footer is
  // always rendered, so nothing is hidden before this resolves.
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    setDaysLeft(getDaysUntil(tender.tender_bid_end_date));
  }, [tender.tender_bid_end_date]);

  const countdown =
    tender.isLive && daysLeft !== null && daysLeft >= 0 ? daysLeft : null;

  const descriptionPreview = tender.tender_description
    ? getDescriptionPreview(
        tender.tender_title ?? "",
        tender.tender_description
      )
    : null;

  return (
    <Link
      href={`/tender/${tender.tender_id}`}
      aria-label={`View tender: ${tender.tender_title || "Untitled Tender"}`}
      className='group relative block overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2'>
      {/* Top Section */}
      <div className='p-4 pb-3'>
        {/* Header Row: Status & Deadline */}
        <div className='mb-2 flex items-center justify-between gap-3'>
          <div className='flex min-w-0 items-center gap-2'>
            <span
              className={cn(
                "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
                tender.isLive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-neutral-300 bg-neutral-100 text-neutral-600"
              )}>
              <span
                className={cn(
                  "mr-1.5 h-1.5 w-1.5 rounded-full",
                  tender.isLive ? "bg-emerald-500" : "bg-neutral-400"
                )}
                aria-hidden='true'
              />
              {tender.isLive ? "Live" : "Closed"}
            </span>
            {vendorLink && <VendorLinkBadge link={vendorLink} />}
            {tender.tender_number && (
              <span className='truncate rounded-md border border-neutral-300 bg-neutral-50 px-1.5 py-0.5 font-mono text-xs tracking-wide text-neutral-500'>
                #{tender.tender_number}
              </span>
            )}
          </div>

          {countdown !== null && (
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
                getDeadlineTone(countdown)
              )}>
              <CalendarClock
                className='size-3'
                aria-hidden='true'
              />
              {getDeadlineLabel(countdown)}
            </span>
          )}
        </div>

        {/* Title & Description - closed tenders recede so open ones lead */}
        <h3
          className={cn(
            "mb-1 line-clamp-2 text-base font-bold leading-snug underline-offset-2 group-hover:underline",
            tender.isLive ? "text-primary" : "text-neutral-700"
          )}>
          {capitalizeFirstLetter(tender.tender_title || "Untitled Tender")}
        </h3>
        {descriptionPreview && (
          <p className='line-clamp-2 text-xs leading-relaxed text-neutral-500'>
            {descriptionPreview}
          </p>
        )}

        {/* Demoted attributes */}
        <div className='mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1'>
          <MetaChip
            icon={Building2}
            label='Department'
            value={tender.tender_department}
          />
          <MetaChip
            icon={MapPin}
            label='Location'
            value={tender.tender_location}
          />
          <MetaChip
            icon={Tag}
            label='Scope'
            value={tender.tender_scope}
          />
        </div>
      </div>

      {/* Footer strip: the two costs and the hard date */}
      <div className='flex flex-col gap-2 border-t border-dashed border-neutral-300 bg-neutral-50/60 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-wrap items-center gap-x-4 gap-y-1.5'>
          <MoneyStat
            icon={FileText}
            label='Doc Fee'
            amount={tender.tender_doc_fee}
          />
          <MoneyStat
            icon={CreditCard}
            label='EMD'
            amount={tender.tender_emd}
          />
          <div className='flex items-center gap-1.5'>
            <CalendarClock
              className='size-3.5 shrink-0 text-neutral-400'
              aria-hidden='true'
            />
            <span className='text-xs text-neutral-500'>
              {tender.isLive ? "Closes" : "Closed on"}
            </span>
            <span className='text-xs font-semibold text-neutral-900'>
              {tender.tender_bid_end_date
                ? formatDisplayDate(tender.tender_bid_end_date)
                : "N/A"}
            </span>
          </div>
        </div>

        {/* Affordance only - the whole card is the link */}
        <span className='flex shrink-0 items-center text-xs font-medium text-neutral-500 transition-colors group-hover:text-primary'>
          View Details
          <ArrowRight
            className='ml-1 size-3 transition-transform group-hover:translate-x-0.5'
            aria-hidden='true'
          />
        </span>
      </div>
    </Link>
  );
};

export default TenderCard;
