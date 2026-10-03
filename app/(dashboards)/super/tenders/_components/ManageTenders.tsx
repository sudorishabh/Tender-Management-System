"use client";
import {
  SearchX,
  Building,
  BadgeIndianRupee,
} from "lucide-react";
import React, { useState } from "react";

import PageError from "@/components/Shared/PageError";
import PageLoading from "@/_components/Shared/PageLoading";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { surfaceStyle } from "@/app/styles";

import ReviewTenderTable from "./ReviewTenderTable";

const ManageBids = () => {
  const [isBidDelete, setIsBidDelete] = useState<string[]>([]);
  const { data, isLoading, isError } = trpc.tender.getReviewTenders.useQuery();

  const reviewTenders = data?.tenders;

  if (isError) {
    return <PageError message='Error fetching bids' />;
  }

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className='space-y-6'>
      <div className={cn(surfaceStyle, "overflow-hidden")}>
        <div className='p-4 bg-gray-50 border-b flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <BadgeIndianRupee
              size={18}
              className='text-primary'
            />
            <h2 className='font-semibold text-gray-900'>Tenders</h2>
          </div>

          <div className='flex items-center gap-4'>
            <div className='flex mr-4 items-center gap-2 text-sm text-gray-500'>
              <Building
                size={16}
                className='text-gray-400'
              />
              <span>
                <span>Total Tenders: {data?.tenders?.length || 0}</span>
              </span>
            </div>
          </div>
        </div>

        {reviewTenders && reviewTenders?.length > 0 ? (
          <ReviewTenderTable
            data={reviewTenders}
            setIsBidDelete={setIsBidDelete}
            isBidDelete={isBidDelete}
          />
        ) : (
          <div className='bg-white p-20 flex flex-col items-center justify-center'>
            <SearchX
              className='mb-4 text-gray-400'
              size={48}
            />
            <h3 className='text-gray-700 font-medium text-lg mb-1'>
              No Tenders found
            </h3>
            <p className='text-gray-500'>There are no bids in the system yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBids;
