"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, FileSearch, Trophy } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { surfaceStyle } from "@/app/styles";
import DashboardWrapper from "@/components/DashboardWrapper";
import PageLoading from "@/_components/Shared/PageLoading";
import PageError from "@/_components/Shared/PageError";
import PaginationComponent from "@/components/Shared/Pagination";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { formatDisplayDate } from "@/utils/dateUtils";

const PAGE_SIZE = 10;

const AwardedTendersPage = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, refetch } =
    trpc.bid.getVendorApprovedBids.useQuery(
      { page, limit: PAGE_SIZE },
      // Keep the current page visible while the next one loads
      { placeholderData: (previousData) => previousData },
    );

  if (isLoading) return <PageLoading />;
  if (isError || !data) return <PageError onRetry={() => refetch()} />;

  const awarded = data.data;

  return (
    <DashboardWrapper
      title='Awarded Tenders'
      description='Tenders where your bid was approved.'
      button={{
        label: "Browse Tenders",
        icon: FileSearch,
        onClick: () => router.push("/"),
      }}>
      <section className={cn(surfaceStyle, "overflow-hidden")}>
        {awarded.length === 0 ? (
          <div className='flex flex-col items-center px-5 py-16 text-center'>
            <span className='flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <Trophy
                aria-hidden
                className='size-5'
              />
            </span>
            <p className='mt-3 text-sm font-medium text-slate-900'>
              No awarded tenders yet
            </p>
            <p className='mt-1 text-sm text-slate-500'>
              Tenders appear here once one of your bids is approved.
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className='bg-slate-50 hover:bg-slate-50'>
                  <TableHead className='pl-5'>Tender</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Bid submitted</TableHead>
                  <TableHead className='pr-5 text-right'>
                    <span className='sr-only'>Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {awarded.map(({ bid, tender }) => (
                  <TableRow key={bid.bid_id}>
                    <TableCell className='max-w-xs pl-5'>
                      <p className='truncate font-medium text-slate-900'>
                        {capitalizeFirstLetter(tender?.tender_title ?? null) ||
                          "Untitled tender"}
                      </p>
                      <p className='truncate text-xs text-slate-500'>
                        {tender?.tender_number || "No reference"}
                      </p>
                    </TableCell>
                    <TableCell className='text-slate-700'>
                      {tender?.tender_department || "N/A"}
                    </TableCell>
                    <TableCell className='text-slate-700'>
                      {tender?.tender_location || "N/A"}
                    </TableCell>
                    <TableCell className='text-slate-700'>
                      {tender?.tender_project_duration || "N/A"}
                    </TableCell>
                    <TableCell className='whitespace-nowrap text-slate-700'>
                      {formatDisplayDate(bid.created_at)}
                    </TableCell>
                    <TableCell className='pr-5 text-right'>
                      <Button
                        asChild
                        variant='ghost'
                        size='sm'
                        className='text-primary hover:text-primary'>
                        <Link href={`/tender/${bid.tender_id}`}>
                          <Eye className='size-3.5' /> View tender
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data.pagination.totalPages > 1 && (
              <PaginationComponent
                currentPage={page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
                isLoading={isFetching}
                className='border-t border-slate-100 py-4'
              />
            )}
          </>
        )}
      </section>
    </DashboardWrapper>
  );
};

export default AwardedTendersPage;
