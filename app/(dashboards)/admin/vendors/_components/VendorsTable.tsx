import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, FilePenLine } from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ITableVendor } from "@/_types/vendor";
import PaginationComponent from "@/components/Shared/Pagination";
import StatusBadge from "@/components/Shared/StatusBadge";

interface Props {
  data: ITableVendor[];
  isFetching: boolean;
  currentPage: number;
  handlePageChange: (page: number) => void;
  totalPages: number;
}

const VendorsTable: FC<Props> = ({
  data,
  isFetching,
  currentPage,
  handlePageChange,
  totalPages,
}) => {
  return (
    <div className='bg-gray-50 p-5 rounded-lg'>
      <ScrollArea className='h-[calc(100vh-20.5rem)] pr-1'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[100px] text-xs'>Status</TableHead>
              <TableHead className='text-xs'>Full Name</TableHead>
              <TableHead className='text-xs'>Email</TableHead>
              <TableHead className='text-xs'>Company Name</TableHead>
              <TableHead className='text-center w-24 text-xs'>
                Details
              </TableHead>
              <TableHead className='text-center w-24 text-xs'>Edit</TableHead>
              {/* <TableHead className='text-center'>Email</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='text-center text-xs text-gray-600 py-8'>
                  Loading vendors...
                </TableCell>
              </TableRow>
            ) : data?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='text-center text-xs text-red-600 py-8'>
                  No vendors found
                </TableCell>
              </TableRow>
            ) : (
              data?.map((vendor) => (
                <TableRow
                  key={vendor.email}
                  className='hover:bg-gray-50'>
                  <TableCell>
                    <StatusBadge status={vendor.vendor_status} />
                  </TableCell>
                  <TableCell className='text-xs text-gray-900 w-[8rem]'>
                    <div className='truncate max-w-[8rem]'>
                      {capitalizeFirstLetter(vendor.full_name)}
                    </div>
                  </TableCell>
                  <TableCell className='text-xs text-gray-900 w-[12rem]'>
                    <div className='truncate max-w-[12rem]'>{vendor.email}</div>
                  </TableCell>
                  <TableCell className='text-xs text-gray-900 w-[15rem]'>
                    <div className='truncate max-w-[15rem]'>
                      {capitalizeFirstLetter(vendor.business_name)}
                    </div>
                  </TableCell>

                  <TableCell className='text-center text-xs'>
                    <Link href={`/admin/vendors/${vendor.vendor_id}`}>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='w-full text-primary  hover: hover:text-primary'>
                        <Eye className='size-3.5' /> View
                      </Button>
                    </Link>
                  </TableCell>
                  <TableCell className='text-center text-xs'>
                    <Link href={`/admin/vendors/${vendor.vendor_id}/edit`}>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='w-full text-primary  hover: hover:text-primary'>
                        <FilePenLine className='size-3.5' /> Edit
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isFetching}
        className='py-8'
      />
    </div>
  );
};

export default VendorsTable;
