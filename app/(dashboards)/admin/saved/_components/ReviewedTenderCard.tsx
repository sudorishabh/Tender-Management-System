import { cardShadowStyle } from "@/app/styles";
import { Calendar, FileText, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { FC } from "react";

export interface IReviewedTenderCardProps {
  tender: {
    tender_id: number;
    tender_title: string | null;
    tender_number: string | null;
    tender_department: string | null;
    tender_status: string | null;
    tender_remark: string | null;
    created_at: string | Date;
    updated_at: string | Date;
  };
}

const ReviewedTenderCard: FC<IReviewedTenderCardProps> = ({ tender }) => {
  const updatedAt = new Date(tender.updated_at);

  return (
    <Link
      href={`/admin/create?id=${tender.tender_id}`}
      className='block group'
      key={tender.tender_id}>
      <div
        className={cn(
          cardShadowStyle,
          "bg-white border border-amber-100 rounded-md overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:border-primary/40 group-hover:bg-primary/5"
        )}>
        <div className='p-6'>
          <div className='flex justify-between items-start mb-4'>
            <span className='px-3 py-1 rounded-full text-xs font-medium bg-primary/5 text-primary border border-primary/10'>
              Rescheduled / Reviewed
            </span>
            <span className='flex items-center text-xs text-gray-500'>
              <Calendar className='h-3 w-3 mr-1' />
              {updatedAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <h3
            className='text-lg font-semibold text-gray-800 mb-3 line-clamp-2'
            title={tender.tender_title ?? undefined}>
            {tender.tender_title || "Untitled Tender"}
          </h3>

          <div className='flex flex-col space-y-3 mt-4'>
            <div className='flex items-center text-sm text-gray-600'>
              <div className='bg-gray-100 p-2 rounded-md mr-3'>
                <FileText className='h-4 w-4 text-gray-600' />
              </div>
              <span className='line-clamp-1 font-medium'>
                #{tender.tender_number || "N/A"}
              </span>
            </div>
            {tender.tender_remark && (
              <div className='flex items-start text-sm text-gray-700'>
                <div className='bg-primary/5 p-2 rounded-md mr-3 mt-0.5'>
                  <MessageSquare className='h-4 w-4 text-primary' />
                </div>
                <div className='flex-1'>
                  <p className='text-xs font-semibold text-primary mb-1'>
                    Review Remark
                  </p>
                  <p className='text-sm text-gray-700 line-clamp-2'>
                    {tender.tender_remark}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ReviewedTenderCard;
