"use client";
import React from "react";
import { CalendarClock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { RecentActivityPanel } from "@/components/Dashboard/RecentActivityPanel";
import DateCountdown from "@/app/(dashboards)/vendor/_components/DateCountdown";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { formatDisplayDate } from "@/utils/dateUtils";
import SidebarRow from "./SidebarRow";

// Short forms - the card title already says these are bid openings
const stageLabels = {
  technical: "Technical",
  financial: "Financial",
} as const;

/**
 * Technical and financial bid openings still ahead on tenders the signed-in
 * vendor has bid on, soonest first. Hidden when none are scheduled.
 */
const UpcomingOpeningsCard = () => {
  // Same query and options as the banner, so this reads its cached result
  const { data } = trpc.vendor.getDashboard.useQuery(undefined, {
    staleTime: 60 * 1000,
  });

  const openings = data?.upcomingOpenings ?? [];
  if (openings.length === 0) return null;

  return (
    <RecentActivityPanel
      title='Upcoming bid openings'
      icon={CalendarClock}
      viewAllHref='/vendor/purchased'
      emptyMessage='No bid openings scheduled for your bids'
      isEmpty={false}>
      {openings.map((opening) => (
        <SidebarRow
          key={`${opening.tender_id}-${opening.stage}`}
          href={`/tender/${opening.tender_id}`}
          title={
            capitalizeFirstLetter(opening.tender_title) || "Untitled tender"
          }
          meta={`${stageLabels[opening.stage]} · ${formatDisplayDate(opening.opens_at)}`}>
          <DateCountdown date={opening.opens_at} />
        </SidebarRow>
      ))}
    </RecentActivityPanel>
  );
};

export default UpcomingOpeningsCard;
