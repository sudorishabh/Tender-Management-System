import { ISavedTenderCard } from "@/_types/tender/savedTender.type";
import { Edit } from "lucide-react";
import { Calendar, FileText } from "lucide-react";
import { Trash } from "lucide-react";
import Link from "next/link";
import React, { FC } from "react";
import { cardShadowStyle } from "@/app/styles";
import { cn } from "@/lib/utils";

interface Props {
  savedTender: ISavedTenderCard;
  handleConfirmDelete: (id: number) => void;
}

const savedTenderCard: FC<Props> = ({ savedTender, handleConfirmDelete }) => {
  return (
    <div
      key={savedTender.tender_id}
      className={cn(
        cardShadowStyle,
        "bg-white border border-gray-100 rounded-md overflow-hidden"
      )}>
      <div className='p-6'>
        <div className='flex justify-between items-start mb-4'>
          <span className='px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800'>
            Draft
          </span>
          <span className='flex items-center text-xs text-gray-500'>
            <Calendar className='h-3 w-3 mr-1' />
            {new Date(savedTender.updated_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <h3
          className='text-lg font-semibold text-gray-800 mb-3 line-clamp-2'
          title={savedTender.tender_title ?? undefined}>
          {savedTender.tender_title || "Untitled Tender"}
        </h3>

        <div className='flex flex-col space-y-3 mt-4'>
          <div className='flex items-center text-sm text-gray-600'>
            <div className='bg-gray-100 p-2 rounded-md mr-3'>
              <FileText className='h-4 w-4 text-gray-600' />
            </div>
            <span className='line-clamp-1 font-medium'>
              #{savedTender.tender_number || "N/A"}
            </span>
          </div>
        </div>
      </div>

      <div className='flex justify-between border-t border-gray-100 bg-gray-50'>
        <Link
          href={`/admin/create?id=${savedTender.tender_id}`}
          className='flex-1 p-3 text-gray-700 flex items-center justify-center text-sm hover:bg-gray-100 transition-colors'>
          <Edit className='size-4 mr-2 text-green-600' />
          Edit
        </Link>
        <button
          onClick={() => handleConfirmDelete(savedTender.tender_id)}
          className='flex-1 p-3 text-gray-700 flex items-center justify-center text-sm hover:bg-gray-100 hover:text-red-600 transition-colors'>
          <Trash className='size-4 mr-2 text-red-500' />
          Delete
        </button>
      </div>
    </div>
  );
};

export default savedTenderCard;
