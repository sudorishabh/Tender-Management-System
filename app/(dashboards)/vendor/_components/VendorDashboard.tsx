"use client";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  ClipboardList,
  FileSearch,
  FileText,
  Send,
  Trophy,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import DashboardWrapper from "@/components/DashboardWrapper";
import PageLoading from "@/_components/Shared/PageLoading";
import PageError from "@/_components/Shared/PageError";
import StatusBadge from "@/components/Shared/StatusBadge";
import DashboardStatTile from "@/components/Dashboard/DashboardStatTile";
import {
  RecentActivityPanel,
  RecentActivityRow,
} from "@/components/Dashboard/RecentActivityPanel";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { formatDisplayDate } from "@/utils/dateUtils";
import VendorProfileSummary from "./VendorProfileSummary";
import AccountStatusBanner from "./AccountStatusBanner";

// Vendors see ranked bids as selected, matching the purchased tenders page
const toVendorBidStatus = (status: string) =>
  status === "ranked" ? "selected" : status;

// Joins the non-empty parts of a row's secondary line with a middot
const joinMeta = (...parts: (string | null | undefined)[]) =>
  parts.filter(Boolean).join(" · ");

const VendorDashboard = () => {
  const router = useRouter();
  const dashboard = trpc.vendor.getDashboard.useQuery();
  const profile = trpc.vendor.getMyProfile.useQuery();

  if (dashboard.isLoading || profile.isLoading) return <PageLoading />;
  if (dashboard.isError || !dashboard.data) {
    return <PageError onRetry={() => dashboard.refetch()} />;
  }

  const { account, bidCounts, openTenderCount, recentBids } = dashboard.data;

  return (
    <DashboardWrapper
      title='Dashboard'
      description='Track your bids and find tenders that are open for bidding.'
      button={{
        label: "Browse Tenders",
        icon: FileSearch,
        onClick: () => router.push("/"),
      }}>
      <div className='space-y-8'>
        <AccountStatusBanner
          status={account.status}
          rejectionReason={account.rejectionReason}
        />

        <section aria-labelledby='overview-heading'>
          <h2
            id='overview-heading'
            className='mb-3 text-sm font-semibold text-slate-900'>
            Overview
          </h2>
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            <DashboardStatTile
              label='Bids submitted'
              value={bidCounts.total}
              icon={Send}
              href='/vendor/purchased'
              detail={`${bidCounts.underReview} under review · ${bidCounts.rejected} rejected`}
            />
            <DashboardStatTile
              label='Selected'
              value={bidCounts.selected}
              icon={BadgeCheck}
              href='/vendor/purchased'
              detail='Shortlisted during evaluation'
            />
            <DashboardStatTile
              label='Approved'
              value={bidCounts.approved}
              icon={Trophy}
              href='/vendor/purchased'
              detail='Accepted after evaluation'
            />
            <DashboardStatTile
              label='Open tenders'
              value={openTenderCount}
              icon={FileText}
              href='/'
              detail='Accepting bids, not yet bid on'
            />
          </div>
        </section>

        <div className='grid gap-6 lg:grid-cols-3'>
          <div className='lg:col-span-2'>
            <RecentActivityPanel
              title='Recent bids'
              icon={ClipboardList}
              viewAllHref='/vendor/purchased'
              emptyMessage="You haven't submitted any bids yet"
              isEmpty={recentBids.length === 0}>
              {recentBids.map((bid) => (
                <RecentActivityRow
                  key={bid.bid_id}
                  href={`/tender/${bid.tender_id}`}
                  title={
                    capitalizeFirstLetter(bid.tender_title) || "Untitled tender"
                  }
                  meta={joinMeta(
                    bid.tender_number,
                    `Submitted ${formatDisplayDate(bid.created_at)}`,
                  )}>
                  <StatusBadge status={toVendorBidStatus(bid.bid_status)} />
                </RecentActivityRow>
              ))}
            </RecentActivityPanel>
          </div>
          <VendorProfileSummary profile={profile.data?.vendorDetails} />
        </div>
      </div>
    </DashboardWrapper>
  );
};

export default VendorDashboard;
