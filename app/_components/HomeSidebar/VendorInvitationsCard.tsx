"use client";
import React from "react";
import { MailOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { RecentActivityPanel } from "@/components/Dashboard/RecentActivityPanel";
import DateCountdown from "@/app/(dashboards)/vendor/_components/DateCountdown";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { formatDisplayDate } from "@/utils/dateUtils";
import SidebarRow from "./SidebarRow";

/**
 * Open tenders the signed-in vendor was invited to and hasn't bid on yet,
 * nearest deadline first. Hidden when no invitation is waiting.
 */
const VendorInvitationsCard = () => {
  // Same query and options as the banner, so this reads its cached result
  const { data } = trpc.vendor.getDashboard.useQuery(undefined, {
    staleTime: 60 * 1000,
  });

  const invitedTenders = data?.invitedTenders ?? [];
  if (invitedTenders.length === 0) return null;

  return (
    <RecentActivityPanel
      title='Invitations to bid'
      icon={MailOpen}
      emptyMessage='No pending invitations'
      isEmpty={false}>
      {invitedTenders.map((tender) => (
        <SidebarRow
          key={tender.tender_id}
          href={`/tender/${tender.tender_id}`}
          title={
            capitalizeFirstLetter(tender.tender_title) || "Untitled tender"
          }
          meta={`Closes ${formatDisplayDate(tender.tender_bid_submission_deadline)}`}>
          <DateCountdown date={tender.tender_bid_submission_deadline} />
        </SidebarRow>
      ))}
    </RecentActivityPanel>
  );
};

export default VendorInvitationsCard;
