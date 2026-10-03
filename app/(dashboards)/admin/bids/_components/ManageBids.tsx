"use client";
import {
  SearchX,
  Building,
  BadgeIndianRupee,
} from "lucide-react";
import React from "react";
import BidsTable from "./BidsTable";
import AdminManageVendorSkeleton from "./AdminManageVendorSkeleton";
import PageError from "@/components/Shared/PageError";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { surfaceStyle } from "@/app/styles";

const ManageBids = () => {
  const { data, isLoading, isError } = trpc.bid.getAll.useQuery();

  const bids = data?.data || [];

  if (isLoading) return <AdminManageVendorSkeleton />;

  if (isError) {
    return <PageError message='Error fetching bids' />;
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
            <h2 className='font-semibold text-gray-900'>Bids</h2>
          </div>

          <div className='flex items-center gap-4'>
            <div className='flex mr-4 items-center gap-2 text-sm text-gray-500'>
              <Building
                size={16}
                className='text-gray-400'
              />
              <span>Total Bids: {bids?.length || 0}</span>
            </div>

          </div>
        </div>

        {bids?.length > 0 ? (
          <BidsTable
            data={bids}

          />
        ) : (
          <div className='bg-white p-20 flex flex-col items-center justify-center'>
            <SearchX
              className='mb-4 text-gray-400'
              size={48}
            />
            <h3 className='text-gray-700 font-medium text-lg mb-1'>
              No bids found
            </h3>
            <p className='text-gray-500'>There are no bids in the system yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBids;
