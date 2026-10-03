"use client";
import React from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import PageLoading from "@/_components/Shared/PageLoading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, FileText, Mail, Building2, Phone } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const VendorDashboard = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Fetch purchased bids (using userId as vendorId string as per service implementation)
  const { data: bidsData, isLoading: bidsLoading } =
    trpc.bid.getVendorPurchasedBids.useQuery(
      { vendorId: userId?.toString() || "" },
      { enabled: !!userId }
    );

  // Fetch profile info
  const { data: profileData, isLoading: profileLoading } =
    trpc.vendor.getMyProfile.useQuery(undefined, { enabled: !!userId });

  if (bidsLoading || profileLoading) {
    return <PageLoading />;
  }

  const bids = bidsData?.result || [];
  const profile = profileData?.vendorDetails;

  return (
    <div className='px-4 md:px-8 py-6 space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Vendor Dashboard</h1>
        <p className='text-xs text-muted-foreground mt-1'>
          Manage your profile and track your tender participation.
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Profile Section - 1 Column */}
        <Card className='lg:col-span-1 h-fit shadow-sm border-t-4 border-t-purple-600'>
          <CardHeader className="pb-2">
            <CardTitle className='flex items-center gap-2 text-lg'>
              <User className='h-4 w-4 text-purple-600' />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4 pt-2'>
            {profile ? (
              <>
                <div className='space-y-4'>
                  <div className='grid gap-1'>
                    <span className='font-medium text-muted-foreground uppercase tracking-wider text-[10px]'>
                      Organization
                    </span>
                    <div className='flex items-center gap-2'>
                      <Building2 className='h-3 w-3 text-gray-500' />
                      <p className='font-semibold text-sm'>
                        {profile.business?.biz_trade_name ||
                          profile.business?.biz_legal_name ||
                          "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className='grid gap-1'>
                    <span className='font-medium text-muted-foreground uppercase tracking-wider text-[10px]'>
                      Status
                    </span>
                    <div>
                      <Badge
                        variant={
                          profile.user.vendor_status === "approved"
                            ? "default"
                            : "secondary"
                        }
                        className={cn(
                          "capitalize text-[10px] px-2 py-0 h-5",
                          profile.user.vendor_status === "approved"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-yellow-600 hover:bg-yellow-700"
                        )}
                      >
                        {profile.user.vendor_status}
                      </Badge>
                    </div>
                  </div>

                  <div className='grid gap-1'>
                    <span className='font-medium text-muted-foreground uppercase tracking-wider text-[10px]'>
                      Contact Info
                    </span>
                    <div className='space-y-1.5'>
                      <div className='flex items-center gap-2'>
                        <Mail className='h-3 w-3 text-gray-500' />
                        <p className='text-xs truncate' title={profile.user.email || ""}>
                          {profile.user.email}
                        </p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Phone className='h-3 w-3 text-gray-500' />
                        <p className='text-xs'>
                          {profile.user.vendor_contact || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='pt-1'>
                  <Link href='/vendor/profile'>
                    <Button variant='outline' size="sm" className='w-full text-xs h-8'>
                      Edit Profile Information
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className='text-center py-4'>
                <p className='text-xs text-muted-foreground mb-3'>
                  Profile information not available.
                </p>
                <Link href='/vendor/profile'>
                  <Button size="sm" className="text-xs h-8">Create Profile</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Purchased Bids Section - 2 Columns */}
        <Card className='lg:col-span-2 shadow-sm border-t-4 border-t-blue-600'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <FileText className='h-4 w-4 text-blue-600' />
              Purchased Bids
            </CardTitle>
            {bids.length > 0 && (
              <Badge variant='outline' className='ml-auto text-[10px]'>
                {bids.length} Total
              </Badge>
            )}
          </CardHeader>
          <CardContent className='pt-4'>
            {bids.length > 0 ? (
              <div className='space-y-3'>
                {bids.map(({ bid, tender }) => (
                  <div
                    key={bid.bid_id}
                    className='group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-3 hover:bg-slate-50 transition-colors'
                  >
                    <div className='space-y-1 min-w-0'>
                      <div className='flex items-center gap-2 flex-wrap'>
                        <h3 className='font-semibold text-sm truncate sm:max-w-[300px]' title={tender?.tender_title || "Untitled Tender"}>
                          {tender?.tender_title || "Untitled Tender"}
                        </h3>
                        <Badge
                          variant='secondary'
                          className={cn(
                            "text-[10px] capitalize px-1.5 py-0 h-5",
                            bid.bid_status === "approved" && "bg-green-100 text-green-800",
                            bid.bid_status === "rejected" && "bg-red-100 text-red-800",
                            bid.bid_status === "under_review" && "bg-blue-100 text-blue-800"
                          )}
                        >
                          {bid.bid_status ? bid.bid_status.replace("_", " ") : "Unknown"}
                        </Badge>
                      </div>
                      <p className='text-xs text-muted-foreground line-clamp-1'>
                        Ref: {tender?.tender_number || "N/A"}
                      </p>
                      <div className='text-[10px] text-muted-foreground flex items-center gap-3'>
                        <span>
                          Applied:{" "}
                          {bid.created_at
                            ? format(new Date(bid.created_at), "MMM d, yyyy")
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    <Link href={`/tender/${bid.tender_id}`}>
                      <Button size='sm' variant="outline" className="w-full sm:w-auto text-xs h-7 px-3">View Details</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <div className='bg-slate-100 p-3 rounded-full mb-3'>
                  <FileText className='h-6 w-6 text-slate-400' />
                </div>
                <h3 className='font-semibold text-sm mb-1'>No Bids Found</h3>
                <p className='text-xs text-muted-foreground max-w-sm mb-3'>
                  You haven&apos;t participated in any tenders yet. Explore active tenders to get started.
                </p>
                <Link href='/'>
                  <Button size="sm" className="text-xs h-8">Browse Active Tenders</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboard;
