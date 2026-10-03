"use client";
import Link from "next/link";
import React from "react";
import { ChevronRight, FileText, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import AccountStatusBanner from "@/app/(dashboards)/vendor/_components/AccountStatusBanner";
import { getProfileCompleteness } from "@/app/(dashboards)/vendor/_components/profileCompleteness";

interface BannerStat {
  value: number;
  label: string;
}

/** Row of headline counts under the hero copy. */
const BannerStats = ({ stats }: { stats: BannerStat[] }) => (
  <dl className='flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/20 pt-4'>
    {stats.map((stat) => (
      <div key={stat.label}>
        <dt className='text-xs uppercase tracking-wider text-white/70'>
          {stat.label}
        </dt>
        <dd className='text-xl font-bold text-white md:text-2xl'>
          {stat.value}
        </dd>
      </div>
    ))}
  </dl>
);

/**
 * Portal-wide counts.
 *
 * Hidden while loading, and also hidden when nothing is currently open - a
 * hero advertising "0 open tenders" is worse than no strip at all. The list
 * below still reports the real count either way.
 */
const HomeBannerStats = () => {
  const { data } = trpc.tender.getHomeStats.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  if (!data || data.openTenders === 0) return null;

  return (
    <BannerStats
      stats={[
        { value: data.openTenders, label: "Open tenders" },
        { value: data.departments, label: "Departments" },
        { value: data.closingThisWeek, label: "Closing this week" },
      ]}
    />
  );
};

/** Where the signed-in vendor stands: what they can act on right now. */
const VendorBannerStats = ({
  stats,
}: {
  stats?: { openToBid: number; invitations: number; underReview: number };
}) => {
  if (!stats) return null;

  return (
    <BannerStats
      stats={[
        { value: stats.openToBid, label: "Open to bid" },
        { value: stats.invitations, label: "Invitations" },
        { value: stats.underReview, label: "Bids under review" },
      ]}
    />
  );
};

/** Nudges vendors with gaps in their profile towards the profile page. */
const VendorProfileNudge = () => {
  const { data } = trpc.vendor.getMyProfile.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const percent = data?.vendorDetails
    ? getProfileCompleteness(data.vendorDetails).percent
    : 100;

  if (percent === 100) {
    return <>Here&apos;s where your bids and invitations stand.</>;
  }

  return (
    <>
      Your profile is {percent}% complete.{" "}
      <Link
        href='/vendor/profile'
        className='font-medium text-white underline underline-offset-2 hover:no-underline'>
        Finish your profile
      </Link>
    </>
  );
};

const SignedInBanner = ({
  userName,
  isVendor,
  isAdmin,
}: {
  userName: string;
  isVendor: boolean;
  isAdmin: boolean;
}) => {
  const { data: dashboard } = trpc.vendor.getDashboard.useQuery(undefined, {
    enabled: isVendor,
    staleTime: 60 * 1000,
  });

  return (
    <div className='mb-5 space-y-3'>
      <div className='relative overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary/90 shadow-md'>
        {/* Decorative elements */}
        <div className='absolute top-0 right-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-10'></div>
        <div className='absolute bottom-0 left-0 h-24 w-24 -translate-x-1/4 translate-y-1/4 rounded-full bg-white opacity-5'></div>

        {/* Top accent line */}
        <div className='absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-white/50 via-white to-white/50'></div>

        <div className='relative z-10 space-y-4 px-4 py-4 md:px-6'>
          <div className='flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center'>
            {/* Welcome message */}
            <div className='flex items-center gap-3'>
              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm'>
                <User className='h-4 w-4 text-white' />
              </div>
              <div>
                <h2 className='text-sm font-semibold text-white'>
                  Welcome back, {userName}!
                </h2>
                <p className='text-xs text-white/80'>
                  {isVendor ? (
                    <VendorProfileNudge />
                  ) : (
                    "Here's what is open on the portal right now."
                  )}
                </p>
              </div>
            </div>

            {/* Quick action - the header already links to the dashboard */}
            {(isVendor || isAdmin) && (
              <Link href={isVendor ? "/vendor/purchased" : "/admin/bids"}>
                <button className='flex items-center gap-1.5 rounded-lg bg-white border-2 border-white px-3 py-1.5 text-xs font-semibold text-primary shadow-sm transition-all hover:shadow-md hover:scale-[1.02]'>
                  <FileText className='h-3.5 w-3.5' />
                  <span>{isVendor ? "My Bids" : "Manage Bids"}</span>
                </button>
              </Link>
            )}
          </div>

          {isVendor ? (
            <VendorBannerStats
              stats={
                dashboard && {
                  openToBid: dashboard.openTenderCount,
                  invitations: dashboard.invitedTenderCount,
                  underReview: dashboard.bidCounts.underReview,
                }
              }
            />
          ) : (
            <HomeBannerStats />
          )}
        </div>
      </div>

      {dashboard && (
        <AccountStatusBanner
          status={dashboard.account.status}
          rejectionReason={dashboard.account.rejectionReason}
        />
      )}
    </div>
  );
};

const HomeBanner = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isRefreshing = status === "loading";

  if (isRefreshing) return null;

  // Authenticated user banner
  if (isAuthenticated) {
    const userRole = session?.user?.role;

    return (
      <SignedInBanner
        userName={session?.user?.name || "User"}
        isVendor={userRole === "vendor"}
        isAdmin={userRole === "admin" || userRole === "super_admin"}
      />
    );
  }

  // Unauthenticated user banner
  return (
    <div className='relative mb-5 overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary/90 shadow-lg'>
      {/* Decorative element */}
      <div className='absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-10'></div>

      {/* Top accent line */}
      <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-white/50 via-white to-white/50'></div>

      <div className='relative z-10 px-5 md:px-8 py-6 md:py-9'>
        <div className='mx-auto max-w-4xl'>
          <h1 className='mb-2.5 text-2xl font-bold leading-tight text-white md:text-4xl'>
            TERI Official eTender Portal
          </h1>

          <p className='mb-6 max-w-2xl text-sm leading-relaxed text-white/90 md:text-base'>
            Welcome to The Energy and Resources Institute (TERI) tender portal.
            Discover, bid, and manage tenders for sustainable development,
            energy research, and environmental projects.
          </p>

          <HomeBannerStats />

          <div className='mt-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center'>
            <div className='flex gap-2.5'>
              <Link href='/register'>
                <button className='rounded-lg bg-white px-4 py-2 text-xs font-semibold text-primary shadow-md transition-all hover:shadow-lg hover:scale-105'>
                  Register Now
                </button>
              </Link>
              <Link href='/sign-in'>
                <button className='rounded-lg border-2 border-white/60 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-white/20 hover:border-white'>
                  Sign In
                </button>
              </Link>
            </div>
            <Link
              href='/about'
              className='flex items-center text-white/90 text-xs font-medium hover:text-white transition-colors group'>
              <span className='underline-offset-4 group-hover:underline'>
                Learn More
              </span>
              <ChevronRight className='h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform' />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeBanner;
