"use client";
import AdminSavedTendersSkeleton from "@/components/Shared/skeleton/AdminSavedTendersSkeleton";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SavedTenderCard from "./SavedTenderCard";
import ReviewedTenderCard from "./ReviewedTenderCard";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cardShadowStyle, secondaryButtonStyle2 } from "@/app/styles";
import SavedTenderDeleteDialog from "./SavedTenderDeleteDialog";
import { cn } from "@/lib/utils";
import { useSavedTenders, useReviewedTenders } from "../_hooks/useSavedTenders";

const SavedTenders = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive activeTab directly from URL
  const tabFromUrl = searchParams.get("tab") as "draft" | "reviewed" | null;
  const activeTab: "draft" | "reviewed" =
    tabFromUrl && ["draft", "reviewed"].includes(tabFromUrl)
      ? tabFromUrl
      : "draft";

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Separate fetching logic using custom hooks
  const {
    savedTenders,
    isLoading: isDraftLoading,
  } = useSavedTenders();

  const { tenders: reviewedTenders, isLoading: isReviewedLoading } =
    useReviewedTenders();

  const deleteMutation = trpc.tender.deleteSaved.useMutation();

  const handleConfirmDelete = async (id: number) => {
    setDeleteId(id);
    setIsConfirmDeleteOpen(true);
  };

  const handleOnClose = () => {
    setIsConfirmDeleteOpen(false);
    setDeleteId(null);
  };

  const handleOnConfirm = async () => {
    deleteMutation.mutate(
      { id: deleteId! },
      {
        onSuccess: () => {
          handleOnClose();
        },
      }
    );
  };

  // Handle tab change by updating URL
  const handleTabChange = (tab: "draft" | "reviewed") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const isLoading =
    (activeTab === "draft" && isDraftLoading) ||
    (activeTab === "reviewed" && isReviewedLoading);

  if (isLoading) {
    return <AdminSavedTendersSkeleton />;
  }

  return (
    <div>
      <div className='mb-6 flex border-b border-gray-200 space-x-4'>
        <button
          type='button'
          onClick={() => handleTabChange("draft")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === "draft"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}>
          Draft Tenders
        </button>
        <button
          type='button'
          onClick={() => handleTabChange("reviewed")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === "reviewed"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}>
          Reviewed / Rescheduled
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {activeTab === "draft" && savedTenders.length > 0 && (
          <Link
            href='/admin/create'
            className='block group'>
            <div
              className={cn(
                cardShadowStyle,
                "h-full bg-white border border-gray-100 rounded-md p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-lg hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
              )}>
              <div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors'>
                <Plus className='h-8 w-8 text-primary' />
              </div>
              <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                Create New Tender
              </h3>
              <p className='text-gray-600 text-center'>
                Start a fresh tender creation process
              </p>
            </div>
          </Link>
        )}

        {activeTab === "draft" &&
          savedTenders.map((savedTender) => (
            <SavedTenderCard
              key={savedTender.tender_id}
              savedTender={savedTender}
              handleConfirmDelete={handleConfirmDelete}
            />
          ))}

        {activeTab === "draft" && savedTenders.length === 0 && (
          <div className='bg-white rounded-md p-10 text-center shadow-md border border-gray-300'>
            <div className='mb-4 mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100'>
              <FileText className='h-8 w-8 text-gray-400' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No saved tenders
            </h3>
            <p className='text-gray-600 mb-6'>
              You haven&apos;t created any draft tenders yet.
            </p>
            <Link href='/admin/create'>
              <Button className={secondaryButtonStyle2}>
                <Plus className='h-5 w-5 mr-2' />
                Create your first tender
              </Button>
            </Link>
          </div>
        )}

        {activeTab === "reviewed" &&
          reviewedTenders.map((tender) => (
            <ReviewedTenderCard
              key={tender.tender_id}
              tender={tender}
            />
          ))}

        {activeTab === "reviewed" && reviewedTenders.length === 0 && (
          <div className='bg-white rounded-md p-10 text-center shadow-md border border-gray-300 col-span-full'>
            <div className='mb-4 mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100'>
              <FileText className='h-8 w-8 text-gray-400' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No reviewed/rescheduled tenders
            </h3>
            <p className='text-gray-600 mb-6'>
              There are no tenders marked as reviewed or rescheduled yet.
            </p>
          </div>
        )}
      </div>
      <SavedTenderDeleteDialog
        isOpen={isConfirmDeleteOpen}
        onClose={handleOnClose}
        onConfirm={handleOnConfirm}
      />
    </div>
  );
};

export default SavedTenders;
