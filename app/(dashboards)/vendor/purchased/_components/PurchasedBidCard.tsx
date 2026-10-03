import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { surfaceStyle } from "@/app/styles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/Shared/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDisplayDateTime } from "@/utils/dateUtils";
import { toVendorBidStatus } from "../../_components/vendorBidStatus";

interface Bid {
  bid_id: number;
  tender_id: number;
  bid_status: string;
  created_at: Date | string;
  bid_rejection_msg?: string | null;
}

interface Tender {
  tender_id: number;
  tender_number?: string | null;
  tender_title?: string | null;
  tender_department?: string | null;
  tender_location?: string | null;
  tender_type?: string | null;
  tender_scope?: string | null;
  tender_bid_submission_deadline?: Date | string | null;
}

interface BidCardProps {
  bid: Bid;
  tender: Tender | null;
}

const PurchasedBidCard: React.FC<BidCardProps> = ({ bid, tender }) => {
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  const showRejectionReason =
    bid.bid_status === "rejected" && !!bid.bid_rejection_msg;

  return (
    <>
      <article className={cn(surfaceStyle, "overflow-hidden")}>
        <div className='flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between'>
          <div className='min-w-0 space-y-1.5'>
            <p className='flex items-center gap-1.5 text-xs font-medium text-slate-500'>
              <FileText
                aria-hidden
                className='size-3.5 text-primary'
              />
              Tender #{tender?.tender_number || bid.tender_id}
            </p>
            <h2 className='line-clamp-2 text-base font-semibold text-slate-900'>
              {tender?.tender_title || "Tender Title"}
            </h2>
            <p className='text-xs text-slate-600'>
              <span className='text-slate-500'>Department:</span>{" "}
              {tender?.tender_department || "N/A"}
              <span
                aria-hidden
                className='mx-2 text-slate-300'>
                |
              </span>
              <span className='text-slate-500'>Location:</span>{" "}
              {tender?.tender_location || "N/A"}
            </p>
            {(tender?.tender_type || tender?.tender_scope) && (
              <div className='flex flex-wrap gap-1.5 pt-1'>
                {tender?.tender_type && (
                  <Badge
                    variant='outline'
                    className='border-primary/30 bg-primary/5 px-2 py-0.5 text-xs font-normal text-primary'>
                    {tender.tender_type}
                  </Badge>
                )}
                {tender?.tender_scope && (
                  <Badge
                    variant='outline'
                    className='border-slate-300 bg-slate-50 px-2 py-0.5 text-xs font-normal text-slate-700'>
                    {tender.tender_scope}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <StatusBadge
            status={toVendorBidStatus(bid.bid_status)}
            className='self-start'
          />
        </div>

        <div className='flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between'>
          <dl className='flex flex-wrap gap-x-6 gap-y-1 text-xs'>
            <div className='flex items-center gap-1.5'>
              <Calendar
                aria-hidden
                className='size-3.5 text-slate-400'
              />
              <dt className='text-slate-500'>Submitted</dt>
              <dd className='font-medium text-slate-900'>
                {formatDisplayDateTime(bid.created_at)}
              </dd>
            </div>
            {tender?.tender_bid_submission_deadline && (
              <div className='flex items-center gap-1.5'>
                <Clock
                  aria-hidden
                  className='size-3.5 text-slate-400'
                />
                <dt className='text-slate-500'>Deadline</dt>
                <dd className='font-medium text-slate-900'>
                  {formatDisplayDateTime(tender.tender_bid_submission_deadline)}
                </dd>
              </div>
            )}
          </dl>

          <div className='flex items-center gap-1'>
            {showRejectionReason && (
              <Button
                variant='ghost'
                size='sm'
                className='h-7 text-xs text-red-700 hover:bg-red-50 hover:text-red-800'
                onClick={() => setMessageDialogOpen(true)}>
                <MessageSquare className='mr-1 size-3.5' />
                View Rejection Reason
              </Button>
            )}
            <Button
              asChild
              variant='ghost'
              size='sm'
              className='h-7 text-xs text-primary hover:bg-primary/10 hover:text-primary/80'>
              <Link
                href={`/tender/${tender?.tender_id ?? ""}`}
                target='_blank'
                rel='noopener noreferrer'>
                View Details <ChevronRight className='ml-1 size-3.5' />
              </Link>
            </Button>
          </div>
        </div>
      </article>

      {/* Rejection Message Dialog */}
      <Dialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejection Reason</DialogTitle>
            <DialogDescription>
              Bid #{bid.bid_id} for Tender #
              {tender?.tender_number || bid.tender_id}
            </DialogDescription>
          </DialogHeader>
          <div className='mt-3 rounded-md border border-red-200 bg-red-50 p-3'>
            <p className='text-sm text-gray-800'>
              {bid.bid_rejection_msg || "No rejection reason provided."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PurchasedBidCard;
