"use client";
import Heading from "@/components/Shared/Heading";
import React from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { surfaceStyle } from "@/app/styles";
import { useSession } from "next-auth/react";
import DashboardWrapper from "@/components/DashboardWrapper";
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
    <DashboardWrapper
      title='Purchased Tenders'
      description='All tenders where you have submitted a bid.'>
      <Heading
        title='Purchased Tenders'
        description='All tenders where you have submitted a bid'
        keywords='Purchased, Tenders, Vendor, Bids'
      />

      {bids && bids.length > 0 ? (
        <div className='flex flex-col gap-4'>
          {bids.map((item) => (
            <PurchasedBidCard
              key={item.bid.bid_id}
              bid={item.bid}
              tender={item.tender}
            />
          ))}
        </div>
      ) : (
        <section
          className={cn(
            surfaceStyle,
            "flex flex-col items-center px-5 py-16 text-center",
          )}>
          <span className='flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <ShoppingBag
              aria-hidden
              className='size-5'
            />
          </span>
          <p className='mt-3 text-sm font-medium text-slate-900'>
            You haven&apos;t submitted any bids yet.
          </p>
          <p className='mt-1 text-sm text-slate-500'>
            Find an open tender and submit your first bid.
          </p>
          <Button
            asChild
            className='mt-5'>
            <Link href='/'>Browse Available Tenders</Link>
          </Button>
        </section>
      )}
    </DashboardWrapper>
  );
};

export default PurchasedTendersPage;
