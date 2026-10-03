"use client";
import PageError from "@/_components/Shared/PageError";
import PageLoading from "@/_components/Shared/PageLoading";
import Tender from "./Tender";
import { trpc } from "@/lib/trpc";
import React from "react";
import { useSession } from "next-auth/react";
import { ROLES } from "@/lib/server/constants";
import { Calendar, Lock } from "lucide-react";
import { formatDisplayDateTime } from "@/utils/dateUtils";
import Link from "next/link";
import { Button } from "@/_components/ui/button";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/routers";

type TenderDetailsResponse =
  inferRouterOutputs<AppRouter>["tender"]["getDetails"];

interface Props {
  tenderId: number;
  // Fetched on the server for public tenders so the details are in the HTML
  initialData?: TenderDetailsResponse;
}

const TenderPageClient = ({ tenderId, initialData }: Props) => {
  const { data: session } = useSession();

  // Check if user is admin or super_admin
  const isAdmin =
    session?.user?.role === ROLES.ADMIN ||
    session?.user?.role === ROLES.SUPER_ADMIN;

  const { data, isLoading, isError } = trpc.tender.getDetails.useQuery(
    tenderId,
    { initialData }
  );

  if (isLoading) return <PageLoading />;
  if (isError || data?.success === false || !data?.tenderData)
    return <PageError />;

  const tender = data?.tenderData?.tender;
  const isReleased = data?.tenderData?.isReleased;

  // If tender is not released yet and user is not admin, show message
  if (!isReleased && !isAdmin) {
    const releaseDate = tender?.tender_release_date;
    return (
      <div className='pt-[3.5rem]'>
        <div className='max-w-2xl mx-auto py-16 px-4'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-8 text-center'>
            <div className='h-16 w-16 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center'>
              <Lock className='h-8 w-8 text-blue-600' />
            </div>
            <h2 className='text-2xl font-semibold text-gray-900 mb-3'>
              Tender Not Yet Released
            </h2>
            <p className='text-gray-600 mb-6 max-w-md mx-auto'>
              This tender is scheduled for release at a later date. Please check
              back after the release date to view the tender details and submit
              your bid.
            </p>
            {releaseDate && (
              <div className='mb-6'>
                <div className='inline-flex items-center gap-3 px-5 py-3 bg-blue-50 rounded-lg border border-blue-200'>
                  <Calendar className='h-5 w-5 text-blue-600' />
                  <div className='text-left'>
                    <p className='text-xs text-blue-600 font-medium'>
                      Scheduled Release
                    </p>
                    <p className='text-sm font-semibold text-blue-800'>
                      {formatDisplayDateTime(releaseDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <Link href='/'>
              <Button>
                Browse Available Tenders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='pt-[3.5rem]'>
      <Tender tenderData={data?.tenderData} />
    </div>
  );
};

export default TenderPageClient;
