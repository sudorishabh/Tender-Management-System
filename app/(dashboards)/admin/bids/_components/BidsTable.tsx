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
import { Eye } from "lucide-react";
import Link from "next/link";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/utils/dateUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ITableBid } from "@/_types/bids";
import StatusBadge from "@/components/Shared/StatusBadge";

interface Props {
  data: ITableBid[];
}

const BidsTable: FC<Props> = ({ data }) => {
  return (
    <div className='bg-gray-50 shadow p-5 rounded-lg'>
      <ScrollArea className='h-[calc(100vh-19.5rem)] flex pr-1'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead className='w-[18rem]'>Tender</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className='text-center'>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className='text-center text-red-600'>
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data?.map((bid) => (
                <TableRow key={bid.bid_id}>

                  <TableCell className='font-medium my-auto'>
                    {bid.biz_legal_name || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-col'>
                      <span className='text-sm font-medium line-clamp-1'>
                        {capitalizeFirstLetter(bid.tender_title) || "Untitled Tender"}
                      </span>
                      <span className='text-xs text-gray-500'>
                        {bid.tender_number || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={bid.bid_status} />
                  </TableCell>
                  <TableCell className='text-nowrap'>
                    {formatDisplayDate(bid.created_at)}
                  </TableCell>
                  <TableCell className='text-center'>
                    <Link
                      href={`/admin/tenders/bids/details/${bid.tender_id}/${bid.bid_id}`}>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='w-full text-primary  hover: hover:text-primary'>
                        <Eye className='size-3.5' /> View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default BidsTable;
