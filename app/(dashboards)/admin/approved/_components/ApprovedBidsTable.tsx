"use client";
import React, { FC } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Award } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/utils/dateUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ITableBid } from "@/_types/bids";
import InfiniteScroll from "@/components/Shared/InfiniteScroll";

interface Props {
  data: ITableBid[];
  hasMore: boolean;
  isFetching: boolean;
  refetch: () => void;
  pageRef: React.MutableRefObject<number>;
}

const ApprovedBidsTable: FC<Props> = ({
  data,
  hasMore,
  isFetching,
  refetch,
  pageRef,
}) => {
  return (
    <div className='bg-gray-50 shadow-sm p-6 rounded-md'>
      <ScrollArea className='h-[calc(100vh-24.5rem)] flex pr-1'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='font-semibold'>
                <div className='flex items-center gap-2 text-xs'>
                  {/* <Building2
                    size={16}
                    className='text-green-600'
                  /> */}
                  Company
                </div>
              </TableHead>
              <TableHead className='w-[18rem] font-semibold'>
                <div className='flex items-center gap-2 text-xs'>
                  {/* <Award
                    size={16}
                    className='text-green-600'
                  /> */}
                  Tender
                </div>
              </TableHead>

              <TableHead className='font-semibold'>
                <div className='flex items-center gap-2 text-xs'>
                  Approved Date
                </div>
              </TableHead>
              <TableHead className='text-center font-semibold'>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <InfiniteScroll
              hasMore={hasMore}
              isFetching={isFetching}
              refetch={refetch}
              pageRef={pageRef}
              asTableRows={true}
              className='flex flex-col gap-2 mb-10'>
              {data?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className='text-center text-gray-500 py-12'>
                    <Award
                      className='mx-auto mb-4 text-gray-300'
                      size={48}
                    />
                    <p className='text-lg font-medium text-gray-600'>
                      No approved bids found
                    </p>
                    <p className='text-sm text-gray-500'>
                      Approved bids will appear here
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.map((bid) => (
                  <TableRow
                    key={bid.bid_id}
                    className='hover:bg-green-50/30 transition-colors'>
                    <TableCell className='font-medium my-auto text-gray-900 text-xs'>
                      <div className='flex flex-col'>
                        <span className='font-semibold'>
                          {bid.biz_legal_name || "N/A"}
                        </span>
                        <span className='text-xs text-gray-500 capitalize'>
                          {bid.biz_classification || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col text-xs'>
                        <span className='text-sm font-medium line-clamp-1 text-gray-900'>
                          {bid.tender_title || "Untitled Tender"}
                        </span>
                        <span className='text-xs text-gray-500 font-mono'>
                          {bid.tender_number || "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className='text-nowrap text-gray-700 text-xs'>
                      {formatDisplayDate(bid.created_at)}
                    </TableCell>
                    <TableCell className='text-center'>
                      <Link
                        href={`/admin/live/${bid.tender_id}/bid/${bid.bid_id}`}>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='w-full text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800 border border-green-200 text-xs'>
                          <Eye className='size-3.5 mr-1' />
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </InfiniteScroll>
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default ApprovedBidsTable;
