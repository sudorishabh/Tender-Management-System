"use client";
import Heading from "@/components/Shared/Heading";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import PurchasedBidCard from "./_components/PurchasedBidCard";
import PageLoading from "@/_components/Shared/PageLoading";

const PurchasedTendersPage = () => {
  const { data: session } = useSession();

  const userId = session?.user?.id;

  const { data, isLoading } =
    trpc.bid.getVendorPurchasedBids.useQuery(
      {
        vendorId: userId?.toString() || "",
      },
      { enabled: !!userId }
    );

  const bids = data?.result;

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className='px-8 py-6'>
      <Heading
        title='Purchased Tenders'
        description='All tenders where you have submitted a bid'
        keywords='Purchased, Tenders, Vendor, Bids'
      />

      <div className='mt-6'>
        <h1 className='text-2xl font-bold mb-6'>Your Purchased Tenders</h1>

        {bids && bids.length > 0 ? (
          <>
            <div className='flex flex-col gap-5 mb-10'>
              {bids.map((item) => (
                <PurchasedBidCard
                  key={item.bid.bid_id}
                  bid={item.bid}
                  tender={item.tender}
                />
              ))}
            </div>
          </>
        ) : (
          <div className='text-center py-10'>
            <p className='text-gray-500 mb-4'>
              You haven&apos;t submitted any bids yet.
            </p>
            <Button
              asChild
              className='bg-primary hover:bg-primary'>
              <Link href='/'>Browse Available Tenders</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchasedTendersPage;
