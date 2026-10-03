"use client";
import { useRouter } from "next/navigation";
import {
  BarChart4,
  BriefcaseBusiness,
  ClipboardCheck,
  ClipboardList,
  FilePlus2,
  FileText,
  UserCheck,
  Users,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import DashboardWrapper from "@/components/DashboardWrapper";
import PageLoading from "@/_components/Shared/PageLoading";
import PageError from "@/_components/Shared/PageError";
import StatusBadge from "@/components/Shared/StatusBadge";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { formatDisplayDate } from "@/utils/dateUtils";
import DashboardStatTile from "@/components/Dashboard/DashboardStatTile";
import AttentionCard from "@/components/Dashboard/AttentionCard";
import {
  RecentActivityPanel,
  RecentActivityRow,
} from "@/components/Dashboard/RecentActivityPanel";

const plural = (count: number, singular: string, pluralForm: string) =>
  count === 1 ? singular : pluralForm;

// Joins the non-empty parts of a row's secondary line with a middot
const joinMeta = (...parts: (string | null | undefined)[]) =>
  parts.filter(Boolean).join(" · ");

const AdminDashboard = () => {
  const router = useRouter();
  const { data, isLoading, isError, refetch } =
    trpc.admin.getDashboard.useQuery();

  if (isLoading) return <PageLoading />;
  if (isError || !data) return <PageError onRetry={() => refetch()} />;

  // Only actionable items are shown; the section hides when nothing is due
  const attentionItems = [
    {
      count: data.tendersReadyForReview,
      title: plural(
        data.tendersReadyForReview,
        "tender ready for bid review",
        "tenders ready for bid review",
      ),
      description: "Bid deadline has passed. Evaluate the submitted bids.",
      icon: ClipboardCheck,
      href: "/admin/live?tab=active",
    },
    {
      count: data.totalPendingVendors,
      title: plural(
        data.totalPendingVendors,
        "vendor awaiting approval",
        "vendors awaiting approval",
      ),
      description: "Review registrations so vendors can start bidding.",
      icon: UserCheck,
      href: "/admin/vendors",
    },
  ].filter((item) => item.count > 0);

  return (
    <DashboardWrapper
      title='Dashboard'
      description='Overview of tenders, bids, and vendors.'
      button={{
        label: "Create New Tender",
        icon: FilePlus2,
        onClick: () => router.push("/admin/create"),
      }}>
      <div className='space-y-8'>
        {attentionItems.length > 0 && (
          <section aria-labelledby='attention-heading'>
            <h2
              id='attention-heading'
              className='mb-3 text-sm font-semibold text-slate-900'>
              Needs attention
            </h2>
            <div className='grid gap-4 md:grid-cols-2'>
              {attentionItems.map((item) => (
                <AttentionCard
                  key={item.href}
                  {...item}
                />
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby='overview-heading'>
          <h2
            id='overview-heading'
            className='mb-3 text-sm font-semibold text-slate-900'>
            Overview
          </h2>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <DashboardStatTile
              label='Total tenders'
              value={data.totalTender}
              icon={FileText}
              href='/admin/live'
              detail={`${data.tendersAcceptingBids} open for bids · ${data.totalDraftTender} ${plural(data.totalDraftTender, "draft", "drafts")}`}
            />
            <DashboardStatTile
              label='Total bids'
              value={data.totalBids}
              icon={BriefcaseBusiness}
              href='/admin/bids'
              detail={`${data.totalApprovedBids} approved`}
            />
            <DashboardStatTile
              label='Registered vendors'
              value={data.totalVendors}
              icon={Users}
              href='/admin/vendors'
              detail={`${data.totalApprovedVendors} approved · ${data.totalPendingVendors} pending`}
            />
          </div>
        </section>

        <div className='grid gap-6 lg:grid-cols-2'>
          <RecentActivityPanel
            title='Recent tenders'
            icon={ClipboardList}
            viewAllHref='/admin/live'
            emptyMessage='No tenders yet'
            isEmpty={data.recentTender.length === 0}>
            {data.recentTender.map((tender, i) => {
              const bidCount = data.totalBidsOnTenders[i] ?? 0;
              return (
                <RecentActivityRow
                  key={tender.tender_id}
                  href={`/tender/${tender.tender_id}`}
                  title={capitalizeFirstLetter(tender.tender_title)}
                  meta={joinMeta(
                    tender.tender_number,
                    formatDisplayDate(tender.created_at),
                  )}>
                  <span className='text-xs text-slate-500'>
                    {bidCount} {plural(bidCount, "bid", "bids")}
                  </span>
                  <StatusBadge status={tender.tender_status} />
                </RecentActivityRow>
              );
            })}
          </RecentActivityPanel>

          <RecentActivityPanel
            title='Recent bids'
            icon={BarChart4}
            viewAllHref='/admin/bids'
            emptyMessage='No bids yet'
            isEmpty={data.recentBids.length === 0}>
            {data.recentBids.map((bid) => (
              <RecentActivityRow
                key={bid.bid_id}
                href={`/admin/live/${bid.tender_id}/bid/${bid.bid_id}`}
                title={capitalizeFirstLetter(bid.biz_name) || "Unknown vendor"}
                meta={joinMeta(
                  capitalizeFirstLetter(bid.tender_title),
                  formatDisplayDate(bid.created_at),
                )}>
                <StatusBadge status={bid.bid_status} />
              </RecentActivityRow>
            ))}
          </RecentActivityPanel>
        </div>
      </div>
    </DashboardWrapper>
  );
};

export default AdminDashboard;
