"use client";
import React, { FC } from "react";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ITender } from "@/_types/tender";

interface Props {
  data: ITender[];
  setIsBidDelete: (isBidDelete: string[]) => void;
  isBidDelete: string[];
}

const ReviewTenderTable: FC<Props> = ({
  data,
  isBidDelete,
  setIsBidDelete,
}) => {

  return (
    <div className='bg-gray-50 shadow p-5 rounded-lg'>
      <ScrollArea className='h-[calc(100vh-19.5rem)] flex pr-1'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Tender </TableHead>
              <TableHead>Tender Number</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Tender Scope</TableHead>
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
              data?.map((tenders) => (
                <TableRow key={tenders.tender_id}>
                  <TableCell>
                    <Checkbox
                      className='border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary'
                      onCheckedChange={(val) => {
                        if (val) {
                          setIsBidDelete([
                            ...isBidDelete,
                            tenders.tender_id.toString(),
                          ]);
                        }
                        if (!val) {
                          const arr = isBidDelete.filter(
                            (id) => id !== tenders.tender_id.toString()
                          );
                          setIsBidDelete(arr);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className='font-medium my-auto'>
                    {tenders.tender_title}
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-col'>
                      <span className='text-sm font-medium line-clamp-1'>
                        {tenders.tender_title}
                      </span>
                      <span className='text-xs text-gray-500'>
                        {tenders.tender_number}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{tenders.tender_department || 'N/A'}</TableCell>

                  <TableCell>
                    <div className='flex items-center gap-1'>
                      <span className='font-medium'>
                        {tenders.tender_scope ? capitalizeFirstLetter(tenders.tender_scope) : 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className='text-nowrap'>
                    {formatDisplayDate(tenders.created_at)}
                  </TableCell>
                  <TableCell className='text-center'>
                    <Link href={`/super/tenders/${tenders.tender_id}`}>
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

export default ReviewTenderTable;
