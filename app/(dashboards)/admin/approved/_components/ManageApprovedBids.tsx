"use client";
import { Award, SearchX, Building, CheckCircle } from "lucide-react";
import React, { useEffect, useRef } from "react";
import ApprovedBidsTable from "./ApprovedBidsTable";
import RowTableSkeleton from "@/components/RowTableSkeleton";
import PageError from "@/components/Shared/PageError";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { surfaceStyle } from "@/app/styles";

const ManageApprovedBids = () => {
  const pageRef = useRef(1);
  const { data, isLoading, isError, refetch, isFetching } =
    trpc.bid.getApprovedBids.useQuery({
      page: pageRef.current,
      limit: 10,
    });

  useEffect(() => {
    const timeout = setTimeout(() => {
      pageRef.current = 1;
      refetch();
    }, 500);
    return () => clearTimeout(timeout);
  }, [refetch]);

  if (isLoading) return <RowTableSkeleton />;

  if (isError) {
    return <PageError message='Error fetching approved bids' />;
  }

  return (
    <div className='mx-auto space-y-6 mb-12'>
      <div className={cn(surfaceStyle, "overflow-hidden")}>
        <div className='p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Award
              size={18}
              className='text-green-600'
            />
            <h2 className='font-semibold text-gray-900 text-sm'>
              Approved Bids
            </h2>
          </div>

          <div className='flex items-center gap-4'>
            <div className='flex mr-4 items-center gap-2 text-sm text-gray-600'>
              <Building
                size={16}
                className='text-gray-400'
              />
              <span className='text-xs'>
                Total Approved: {data?.totalApprovedBids || 0}
              </span>
            </div>
            <div className='flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-sm text-sm font-medium'>
              <CheckCircle size={14} />
              <span className='text-xs'>All Approved</span>
            </div>
          </div>
        </div>

        {data?.bids?.length && data?.bids?.length > 0 ? (
          <ApprovedBidsTable
            hasMore={data?.hasMore}
            isFetching={isFetching}
            refetch={refetch}
            pageRef={pageRef}
            data={data.bids}
          />
        ) : (
          <div className='bg-white p-20 flex flex-col items-center justify-center'>
            <SearchX
              className='mb-4 text-gray-400'
              size={48}
            />
            <h3 className='text-gray-700 font-medium text-lg mb-1'>
              No approved bids found
            </h3>
            <p className='text-gray-500'>
              Approved bids will appear here once vendors&apos; bids are
              approved
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageApprovedBids;
