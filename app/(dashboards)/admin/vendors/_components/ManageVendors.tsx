"use client";
import React, { useEffect, useState } from "react";
import { useVendorContext } from "@/context/VendorContext";
import { trpc } from "@/lib/trpc";
import RowTableSkeleton from "@/components/RowTableSkeleton";
import { Building, SearchX, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import VendorsTable from "./VendorsTable";
import { surfaceStyle } from "@/app/styles";

const ManageVendors = () => {
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    manageVendorStatus,
    manageVendorSearch,
    setManageVendorSearch,
    setManageVendorStatus,
    resetVendorFilterOptions,
  } = useVendorContext();

  const loadVendorsLimit = 40;
  const { data, isLoading, isFetching } = trpc.vendor.getAll.useQuery({
    page: currentPage,
    limit: loadVendorsLimit,
    status: manageVendorStatus,
    search: searchInput,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchInput(manageVendorSearch);
    }, 500);
    setCurrentPage(1);
    return () => clearTimeout(timeout);
  }, [manageVendorSearch]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) return <RowTableSkeleton />;

  return (
    <div className='space-y-6'>
      <div className={surfaceStyle}>
        <div className='p-4 bg-gray-50 border-b flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Users
              size={18}
              className='text-primary'
            />
            <h2 className='font-semibold text-gray-900 text-sm'>
              Vendors List
            </h2>
            <div className='flex items-center gap-3'>
              <Input
                placeholder='Search by name, email, or company name'
                className='w-[20rem] text-xs h-8 placeholder:text-xs bg-white rounded-md'
                value={manageVendorSearch}
                onChange={(e) => setManageVendorSearch(e.target.value)}
              />
              <select
                className='py-[0.45rem] px-3 h-8 text-xs bg-white border border-gray-300 rounded-md text-gray-700 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-primary focus:border-primary'
                value={manageVendorStatus}
                onChange={(e) => setManageVendorStatus(e.target.value)}>
                <option value='all'>Sort by Status</option>
                <option value='pending'>Pending</option>
                <option value='approved'>Approved</option>
                <option value='rejected'>Rejected</option>
              </select>

              <Button
                variant='outline'
                className='py-1.5 px-3 h-8 text-xs bg-white border border-gray-300 rounded-md text-gray-700 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-primary focus:border-primary'
                onClick={() => resetVendorFilterOptions()}>
                Reset
              </Button>
            </div>
          </div>
          <div className='flex items-center gap-2 text-sm text-gray-500'>
            <Building
              size={16}
              className='text-gray-400'
            />
            <span className='text-xs'>
              Total Vendors: {data?.totalVendors || 0}
            </span>
          </div>
        </div>

        {data && data?.vendors?.length > 0 ? (
          <VendorsTable
            isFetching={isFetching}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
            totalPages={data?.totalPages || 1}
            data={data.vendors}
          />
        ) : (
          <div className='bg-white p-20 flex flex-col items-center justify-center'>
            <SearchX
              className='mb-4 text-gray-400'
              size={48}
            />
            <h3 className='text-gray-700 font-medium text-lg mb-1'>
              No vendors found
            </h3>
            <p className='text-gray-500'>
              There are currently no registered vendors in the system
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageVendors;
