import {
  primaryButtonStyle,
  secondaryButtonStyle,
  surfaceStyle,
} from "@/app/styles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { cn } from "@/lib/utils";
import { formatDisplayDate, formatDisplayDateTime } from "@/utils/dateUtils";
import {
  Eye,
  FileText,
  Calendar,
  MapPin,
  Tag,
  Hash,
  Building,
  HandCoins,
  IndianRupee,
  Timer,
  Pencil,
  MessageCircleQuestion,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { ITenderCard } from "@/_types/tender/index";
import { normalizeDbDate } from "@/utils/normalizeDbDate";
import StatusBadge from "@/components/Shared/StatusBadge";

function formatTimeRemaining(targetDate: Date): string {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) return "Closed";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""}${hours > 0 ? `, ${hours} hr${hours > 1 ? "s" : ""}` : ""}`;
  }

  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) {
    return `${hours} hr${hours > 1 ? "s" : ""}${minutes > 0 ? `, ${minutes} min` : ""}`;
  }

  return `${minutes} min`;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

interface LiveTenderCardProps {
  tender: ITenderCard;
  showBidDeadline?: boolean;
}

const LiveTenderCard = ({
  tender,
  showBidDeadline = false,
}: LiveTenderCardProps) => {
  // Normalize the date from database for proper comparison
  const bidEndDate = normalizeDbDate(tender.tender_bid_end_date);

  //   ? bidEndDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  //   : false;

  const isPending = bidEndDate && bidEndDate > new Date();

  return (
    <Card className={cn(surfaceStyle, "overflow-hidden")}>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100'>
        <div className='flex items-center space-x-2'>
          <StatusBadge status={tender.isLive ? "live" : "closed"} />
          {/* {isUrgent && !isClosed && (
            <span className='text-xs font-normal text-orange-700 bg-orange-50 px-2 py-0.5 rounded flex items-center'>
              <Clock className='w-3 h-3 mr-1' />
              Urgent
            </span>
          )} */}
        </div>
        <div className='text-xs text-gray-500 flex items-center'>
          <Hash className='w-3 h-3 mr-1' />
          {tender.tender_number}
        </div>
      </div>

      {/* Bid Deadline Banner for Pending Tenders */}
      {showBidDeadline && isPending && bidEndDate && (
        <div className='px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2'>
          <Timer className='w-4 h-4 text-amber-600' />
          <span className='text-xs text-amber-700'>
            <strong>Accepting bids for:</strong>{" "}
            {formatTimeRemaining(bidEndDate)}
          </span>
          <span className='text-xs text-amber-600 ml-auto'>
            Until {formatDisplayDateTime(tender.tender_bid_end_date)}
          </span>
        </div>
      )}

      {/* Main Content */}
      <div className='p-4'>
        {/* Title */}
        <h3 className='text-base font-medium text-gray-800 mb-3 line-clamp-1 leading-tight'>
          {capitalizeFirstLetter(tender.tender_title)}
        </h3>

        {/* Information Grid */}
        <div className='grid grid-cols-2 gap-x-4 gap-y-2 mb-3'>
          <div className='flex items-center text-sm'>
            <Building className='w-3 h-3 mr-2 text-gray-500 flex-shrink-0' />
            <span className='text-gray-600 mr-1 flex-shrink-0'>Dept:</span>
            <span className='font-normal text-gray-700 truncate max-w-[60%]'>
              {capitalizeFirstLetter(tender.tender_department)}
            </span>
          </div>

          <div className='flex items-center text-sm'>
            <Calendar className='w-3 h-3 mr-2 text-gray-500 flex-shrink-0' />
            <span className='text-gray-600 mr-1 flex-shrink-0'>Ends:</span>
            <span
              className={cn(
                "font-normal flex-shrink-0",
                tender.isLive ? "text-orange-600" : "text-gray-700",
              )}>
              {bidEndDate
                ? formatDisplayDate(tender.tender_bid_end_date)
                : "N/A"}
            </span>
          </div>

          <div className='flex items-center text-sm'>
            <FileText className='w-3 h-3 mr-2 text-gray-500 flex-shrink-0' />
            <span className='text-gray-600 mr-1 flex-shrink-0'>Scope:</span>
            <span className='font-normal text-gray-700 truncate max-w-[60%]'>
              {capitalizeFirstLetter(tender.tender_scope)}
            </span>
          </div>

          <div className='flex items-center text-sm'>
            <Tag className='w-3 h-3 mr-2 text-gray-500 flex-shrink-0' />
            <span className='text-gray-600 mr-1 flex-shrink-0'>Type:</span>
            <span className='font-normal text-gray-700 truncate max-w-[60%]'>
              {capitalizeFirstLetter(tender.tender_type)}
            </span>
          </div>

          {tender.tender_location && (
            <div className='flex items-center text-sm col-span-2'>
              <MapPin className='w-3 h-3 mr-2 text-gray-500 flex-shrink-0' />
              <span className='text-gray-600 mr-1 flex-shrink-0'>
                Location:
              </span>
              <span className='font-normal text-gray-700 truncate max-w-[50%]'>
                {capitalizeFirstLetter(tender.tender_location)}
              </span>
            </div>
          )}
        </div>

        {/* Financial Information */}
        <div className='flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 mb-3'>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center'>
              <IndianRupee className='w-3 h-3 mr-1 text-gray-500' />
              <div className='text-xs'>
                <span className='text-gray-600'>Doc Fee: </span>
                <span className='font-medium text-gray-700'>
                  {formatCurrency(Number(tender.tender_doc_fee))}
                </span>
              </div>
            </div>
            <div className='w-px h-4 bg-gray-300'></div>
            <div className='text-xs'>
              <span className='text-gray-600'>EMD: </span>
              <span className='font-medium text-gray-700'>
                {formatCurrency(Number(tender.tender_emd))}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='grid grid-cols-2 gap-2 mt-4'>
          {/* View Details */}
          <Link
            href={`/tender/${tender.tender_id}`}
            className='col-span-1'>
            <Button
              size='sm'
              variant='outline'
              className={cn(
                secondaryButtonStyle,
                "w-full h-9 border-0 bg-gray-200/55",
              )}>
              <Eye className='w-4 h-4 mr-1' />
              Details
            </Button>
          </Link>

          {/* Edit Tender */}
          <Link
            href={`/admin/live/${tender.tender_id}/edit`}
            className='col-span-1'>
            <Button
              size='sm'
              variant='outline'
              className={cn(
                secondaryButtonStyle,
                "w-full h-9 border-0 bg-gray-200/55",
              )}>
              <Pencil className='w-4 h-4 mr-1' />
              Edit
            </Button>
          </Link>

          {/* Vendor clarification questions */}
          <Link
            href={`/admin/live/${tender.tender_id}/clarifications`}
            className='col-span-1'>
            <Button
              size='sm'
              variant='outline'
              className={cn(
                secondaryButtonStyle,
                "w-full h-9 border-0 bg-gray-200/55",
              )}>
              <MessageCircleQuestion className='w-4 h-4 mr-1' />
              Questions
            </Button>
          </Link>

          {/* View Bids */}
          <Link
            href={`/admin/live/${tender.tender_id}/bid`}
            className='col-span-1'>
            <Button
              size='sm'
              className={cn(primaryButtonStyle, "w-full h-9")}>
              <HandCoins className='w-4 h-4 mr-1' />
              Bids
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default LiveTenderCard;
