"use client";
import React from "react";
import { Hourglass } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { RecentActivityPanel } from "@/components/Dashboard/RecentActivityPanel";
import DateCountdown from "@/app/(dashboards)/vendor/_components/DateCountdown";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { formatDisplayDate } from "@/utils/dateUtils";
import SidebarRow from "./SidebarRow";

const CLOSING_SOON_LIMIT = 5;

/** Open tenders with the nearest bid deadlines. Hidden when none are open. */
const ClosingSoonCard = () => {
  const { data } = trpc.tender.getHomeLatest.useQuery(
    {
      page: 1,
      limit: CLOSING_SOON_LIMIT,
      availability: "open",
      sortBy: "deadline-soon",
    },
    { staleTime: 5 * 60 * 1000 }
  );

  // Open tenders without a deadline sort last, and never close soon
  const tenders =
    data?.tenders.filter((tender) => tender.tender_bid_end_date) ?? [];
  if (tenders.length === 0) return null;

  return (
    <RecentActivityPanel
      title='Closing soon'
      icon={Hourglass}
      emptyMessage='No open tenders'
      isEmpty={false}>
      {tenders.map((tender) => (
        <SidebarRow
          key={tender.tender_id}
          href={`/tender/${tender.tender_id}`}
          title={
            capitalizeFirstLetter(tender.tender_title) || "Untitled tender"
          }
          meta={`Closes ${formatDisplayDate(tender.tender_bid_end_date)}`}>
          <DateCountdown date={tender.tender_bid_end_date} />
        </SidebarRow>
      ))}
    </RecentActivityPanel>
  );
};

export default ClosingSoonCard;
