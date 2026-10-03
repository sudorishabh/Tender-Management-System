import React from "react";
import {
  Building2,
  CalendarClock,
  MapPin,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { ITender } from "@/_types/tender";
import StatusBadge from "@/_components/Shared/StatusBadge";
import { cn } from "@/lib/utils";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { formatDisplayDateTime, getDaysUntil } from "@/utils/dateUtils";
import { getDeadlineLabel, getDeadlineTone } from "@/utils/deadline";

interface TenderHeaderProps {
  tender: ITender;
  isLive: boolean;
}

const MetaItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) => (
  <div className='min-w-0'>
    <dt className='flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-neutral-500'>
      <Icon
        className='size-3.5 text-neutral-400'
        aria-hidden='true'
      />
      {label}
    </dt>
    <dd className='mt-1.5 text-sm font-medium text-slate-900'>{value}</dd>
  </div>
);

const TenderHeader: React.FC<TenderHeaderProps> = ({ tender, isLive }) => {
  const deadline = tender.tender_bid_submission_deadline;
  const daysLeft = getDaysUntil(deadline);

  // Same pill as the home tender cards: a countdown while bids are open
  const countdown =
    isLive && daysLeft !== null && daysLeft >= 0 ? daysLeft : null;
  const isClosed = !isLive && daysLeft !== null && daysLeft <= 0;

  return (
    <div className='bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden'>
      <div className='p-6'>
        {/* Status, number and type */}
        <div className='flex flex-wrap items-center gap-x-3 gap-y-2 mb-4'>
          <StatusBadge status={tender.tender_status ?? "draft"} />
          <span className='text-xs text-neutral-500 font-mono'>
            {tender.tender_number ?? "N/A"}
          </span>
          {tender.tender_type && (
            <span className='rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600'>
              {capitalizeFirstLetter(tender.tender_type)} tender
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className='text-xl font-semibold text-primary leading-tight mb-3'>
          {capitalizeFirstLetter(tender.tender_title ?? "")}
        </h1>

        {/* Description */}
        {tender.tender_description && (
          <p className='text-sm text-slate-600 leading-relaxed mb-6'>
            {capitalizeFirstLetter(tender.tender_description)}
          </p>
        )}

        {/* Info Grid */}
        <dl className='grid grid-cols-1 sm:grid-cols-3 gap-5 pt-5 border-t border-neutral-100'>
          <MetaItem
            icon={Building2}
            label='Department'
            value={capitalizeFirstLetter(tender.tender_department ?? "N/A")}
          />
          <MetaItem
            icon={MapPin}
            label='Location'
            value={capitalizeFirstLetter(tender.tender_location ?? "N/A")}
          />
          <MetaItem
            icon={Tag}
            label='Scope'
            value={capitalizeFirstLetter(tender.tender_scope) || "N/A"}
          />
        </dl>
      </div>

      {/* The deadline decides whether a bid is still possible */}
      {deadline && (
        <div className='flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-neutral-100 bg-slate-50 px-6 py-3'>
          <CalendarClock
            className='size-4 shrink-0 text-primary'
            aria-hidden='true'
          />
          <span className='text-sm text-slate-600'>
            Bid submission deadline
          </span>
          <span className='text-sm font-semibold text-slate-900'>
            {formatDisplayDateTime(deadline)}
          </span>
          {countdown !== null && (
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs font-medium",
                getDeadlineTone(countdown)
              )}>
              {getDeadlineLabel(countdown)}
            </span>
          )}
          {isClosed && (
            <span className='rounded-full border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600'>
              Closed
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TenderHeader;
