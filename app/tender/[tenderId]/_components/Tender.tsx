"use client";
import React, { FC } from "react";
import TenderHeader from "./TenderHeader";
import TenderDetails from "./TenderDetails";
import TenderTimeline from "./TenderTimeline";
import TenderJsonLd from "./TenderJsonLd";
import TenderClarifications from "./TenderClarifications";
import TenderDocumentCard from "./TenderDocumentCard";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/_components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { IBidderDocumentsReq, ITender } from "@/_types/tender";
import { ROLES } from "@/lib/server/constants";

interface TenderData {
  tender: ITender;
  bidderDocumentsReq?: IBidderDocumentsReq[];
  isLive?: boolean;
}

interface Props {
  tenderData: TenderData;
}

const Tender: FC<Props> = ({ tenderData }) => {
  const tender = tenderData?.tender;
  const isLive = tenderData?.isLive ?? true; // Default to true if not provided for backward compatibility
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  // Check if bid has already been submitted
  // userId is no longer passed as input — the server derives it from the session.
  const { data: bidSubmissionData, isLoading: isBidCheckLoading } =
    trpc.bid.isBidSubmitted.useQuery(
      {
        tenderId: tender?.tender_id?.toString() || "",
      },
      {
        enabled:
          !!userId && !!tender?.tender_id && session?.user?.role === ROLES.VENDOR,
      }
    );

  const isBidSubmitted = bidSubmissionData?.isSubmitted || false;
  const showLoading = isBidCheckLoading && session?.user?.role === ROLES.VENDOR;

  // Handle case where tender data is not available
  if (!tender) {
    return (
      <div className='min-h-screen bg-neutral-50 pb-24 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-lg text-slate-700'>Loading tender details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-neutral-50 pb-24'>
      {/* Structured Data for SEO */}

      <TenderJsonLd tender={tender} />

      <div className='max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>

        <TenderHeader tender={tender} />


        <div className='mt-6 space-y-5'>
          {/* The PDF is what bidders need most, so it leads the details */}
          {tender.tender_contract_document && (
            <TenderDocumentCard fileKey={tender.tender_contract_document} />
          )}

          <TenderDetails tender={tender} />

          <TenderTimeline tender={tender} />

          <TenderClarifications tenderId={tender.tender_id} />
        </div>
      </div>

      {/* Fixed Bottom Action Bar - Only show when tender is live */}

      <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-lg z-50'>
        <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10'>
                <ShoppingCart
                  className='h-5 w-5 text-primary'
                  strokeWidth={2}
                />
              </div>
              <div>
                <h3 className='text-sm font-semibold text-slate-900'>
                  {!isAuthenticated
                    ? "Authentication Required"
                    : showLoading
                      ? "Checking Bid Status..."
                      : isBidSubmitted
                        ? "Bid Already Submitted"
                        : isLive
                          ? "Purchase Tender Documents"
                          : "Tender Closed"}
                </h3>
                <p className='text-xs text-slate-600'>
                  {!isAuthenticated
                    ? "Please sign in to purchase tender documents"
                    : showLoading
                      ? "Please wait while we verify your bid status"
                      : isBidSubmitted
                        ? "You have already submitted a bid for this tender"
                        : isLive
                          ? "Get access to complete documentation"
                          : "Bid submission deadline has passed"}
                </p>
              </div>
            </div>
            {!isAuthenticated ? (
              <Link href='/sign-in'>
                <Button className='bg-primary hover:bg-primary/90 text-white font-medium h-11 px-8 transition-colors shadow-sm'>
                  Sign In
                </Button>
              </Link>
            ) : showLoading ? (
              <Button
                disabled
                className='bg-gray-400 text-white font-medium h-11 px-8 cursor-not-allowed opacity-60'>
                <Loader2 className='h-5 w-5 animate-spin mr-2' />
                Checking...
              </Button>
            ) : isBidSubmitted ? (
              <Button
                disabled
                className='bg-gray-400 text-white font-medium h-11 px-8 cursor-not-allowed opacity-60'>
                Already Submitted
              </Button>
            ) : isLive ? (
              // Tender is live - allow purchase
              <Link href={`/tender/buy/${tender?.tender_id ?? ''}`}>
                <Button className='bg-primary hover:bg-primary/90 text-white font-medium h-11 px-8 transition-colors shadow-sm'>
                  Proceed to Purchase
                </Button>
              </Link>
            ) : (
              // Tender is not live (deadline passed) - disable purchase
              <Button
                disabled
                className='bg-gray-400 text-white font-medium h-11 px-8 cursor-not-allowed opacity-60'>
                Tender Closed
              </Button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Tender;
