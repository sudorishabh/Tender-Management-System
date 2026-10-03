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

interface Props {
  data: ITableBid[];
}

const BidsTable: FC<Props> = ({ data }) => {
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-600 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-600 border-red-200";
      case "under_review":
        return "bg-yellow-100 text-yellow-600 border-yellow-200";
      case "reviewed":
        return "bg-primary text-primary border-primary";
      case "awarded":
        return "bg-purple-100 text-purple-600 border-purple-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    return capitalizeFirstLetter(status.replace(/_/g, " "));
  };

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
                    <span
                      className={`font-medium text-nowrap border-[0.1rem] rounded-sm text-[0.8rem] px-1 ${getStatusClass(
                        bid.bid_status
                      )}`}>
                      {formatStatus(bid.bid_status)}
                    </span>
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
