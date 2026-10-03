"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BriefcaseBusiness,
  FilePlus2,
  FileText,
  Users,
  BarChart4,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cardShadowStyle } from "@/app/styles";
import { trpc } from "@/lib/trpc";
import DashboardWrapper from "@/components/DashboardWrapper";
import { cn } from "@/lib/utils";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { formatDisplayDate } from "@/utils/dateUtils";
import PageLoading from "@/_components/Shared/PageLoading";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "selected":
      return "bg-green-100 text-green-800 border-green-200";
    case "under_review":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "approved":
      return "bg-green-100 text-green-800 border-green-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    case "ranked":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-primary/10 text-primary border-primary/30";
  }
};

const AdminDashboard = () => {
  const router = useRouter();
  const { data, isLoading } = trpc.admin.getDashboard.useQuery();

  if (isLoading) return <PageLoading />;

  return (
    <DashboardWrapper
      title='Admin Dashboard'
      description='Overview of tenders, bids, and vendors.'
      button={{
        label: "Create New Tender",
        icon: FilePlus2,
        onClick: () => router.push("/admin/create"),
      }}>
      <div>
        <div className='mx-auto mb-12'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <Card
              className={cn(
                cardShadowStyle,
                "bg-gray-50 border border-gray-100 rounded-md"
              )}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3'>
                <CardTitle className='text-xs font-medium'>
                  Total Tenders
                </CardTitle>
                <div className='h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center'>
                  <FileText className='h-3 w-3 text-primary' />
                </div>
              </CardHeader>
              <CardContent className='px-3 pb-3'>
                <div className='text-lg text-nowrap font-bold'>
                  {data?.totalTender}
                </div>
                <div className='flex flex-wrap items-center gap-1.5 mt-1'>
                  <span className='text-xs px-1.5 text-nowrap py-0.5 rounded-sm bg-green-100 text-green-800'>
                    {data?.totalLiveTender} Live
                  </span>

                  <span className='text-xs px-1.5 text-nowrap py-0.5 rounded-sm bg-yellow-100 text-yellow-800'>
                    {data?.totalDraftTender} drafts
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                cardShadowStyle,
                "bg-gray-50 border border-gray-100 rounded-md"
              )}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3'>
                <CardTitle className='text-xs font-medium'>
                  Total Bids
                </CardTitle>
                <div className='h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center'>
                  <BriefcaseBusiness className='h-3 w-3 text-purple-700' />
                </div>
              </CardHeader>
              <CardContent className='px-3 pb-3'>
                <div className='text-lg font-bold'>{data?.totalBids}</div>
                <div className='flex items-center gap-1.5 mt-1'>
                  <span className='text-xs px-1.5 py-0.5 rounded-sm bg-green-100 text-green-800'>
                    {data?.totalApprovedBids} Approved
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                cardShadowStyle,
                "bg-gray-50 border border-gray-100 rounded-md"
              )}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3'>
                <CardTitle className='text-xs font-medium'>
                  Registered Vendors
                </CardTitle>
                <div className='h-6 w-6 rounded-full bg-green-100 flex items-center justify-center'>
                  <Users className='h-3 w-3 text-green-700' />
                </div>
              </CardHeader>
              <CardContent className='px-3 pb-3'>
                <div className='text-lg font-bold'>{data?.totalVendors}</div>
                <div className='flex items-center gap-1.5 mt-1'>
                  <span className='text-xs px-1.5 py-0.5 rounded-sm bg-green-100 text-green-800'>
                    {data?.totalApprovedVendors} Approved
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 mt-4 md:grid-cols-2 gap-6'>
            <div
              className={cn(
                cardShadowStyle,
                "bg-gray-50 rounded-md border border-gray-100 overflow-hidden"
              )}>
              <div className='p-3 bg-gray-50 border-b flex items-center justify-between'>
                <div className='flex items-center gap-1.5'>
                  <ClipboardList
                    size={14}
                    className='text-primary'
                  />
                  <h2 className='font-semibold text-xs text-gray-900'>
                    Recent Tenders
                  </h2>
                </div>
                <Button
                  variant='ghost'
                  className='text-xs h-6 text-primary hover:text-primary/90'
                  onClick={() => router.push("/admin/live")}>
                  View all
                </Button>
              </div>
              <div className='p-4'>
                <div className='space-y-4'>
                  {data?.recentTender && data?.recentTender.length > 0 ? (
                    data?.recentTender.map((tender, i: number) => (
                      <div
                        key={tender.tender_id}
                        className='flex items-center justify-between border-b pb-2 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 px-1'
                        onClick={() =>
                          router.push(`/tender/${tender.tender_id}`)
                        }>
                        <div className='flex flex-col'>
                          <div className='font-medium text-xs line-clamp-1 text-gray-900'>
                            {capitalizeFirstLetter(tender.tender_title)}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {tender.tender_number} •{" "}
                            {formatDisplayDate(tender.created_at)}
                          </div>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <Badge
                            className={cn(
                              getStatusColor(tender.tender_status),
                              "rounded-sm",
                              "text-xs px-1.5 py-0"
                            )}
                            variant='outline'>
                            {capitalizeFirstLetter(tender.tender_status)}
                          </Badge>
                          <span className='text-xs px-1.5 py-0.5 text-nowrap rounded-sm text-center bg-primary/10 text-primary border border-primary/30'>
                            {data?.totalBidsOnTenders[i]}
                            <span className='ml-1'>
                              {data?.totalBidsOnTenders[i] > 1 ? "Bids" : "Bid"}
                            </span>
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-6 text-xs text-gray-500'>
                      No tenders found
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              className={cn(
                cardShadowStyle,
                "bg-gray-50 rounded-md border border-gray-100 overflow-hidden"
              )}>
              <div className='p-3 bg-gray-50 border-b flex items-center justify-between'>
                <div className='flex items-center gap-1.5'>
                  <BarChart4
                    size={14}
                    className='text-primary'
                  />
                  <h2 className='font-semibold text-xs text-gray-900'>
                    Recent Bids
                  </h2>
                </div>
                <Button
                  variant='ghost'
                  className='text-xs h-6 text-primary hover:text-primary/90'
                  onClick={() => router.push("/admin/bids")}>
                  View all
                </Button>
              </div>
              <div className='p-4'>
                <div className='space-y-4'>
                  {data?.recentBids && data?.recentBids.length > 0 ? (
                    data?.recentBids.map((bid) => (
                      <div
                        key={bid.bid_id}
                        className='flex items-center justify-between border-b pb-2 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 px-1'
                        onClick={() =>
                          router.push(`/admin/bids/${bid.bid_id}`)
                        }>
                        <div className='flex flex-col'>
                          <div className='font-medium text-xs text-gray-900 line-clamp-1'>
                            {capitalizeFirstLetter(bid.biz_name)}
                          </div>
                          <div className='text-xs text-gray-500 flex mr-1'>
                            <span className='mr-0.5 w-[60%] line-clamp-1'>
                              {capitalizeFirstLetter(bid.tender_title)}
                            </span>
                            • {formatDisplayDate(bid.created_at)}
                          </div>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <Badge
                            className={cn(
                              getStatusColor(bid.bid_status),
                              "rounded-sm",
                              "text-xs px-1.5 py-0"
                            )}
                            variant='outline'>
                            {capitalizeFirstLetter(bid.bid_status)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-6 text-xs text-gray-500'>
                      No bids found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
};

export default AdminDashboard;
