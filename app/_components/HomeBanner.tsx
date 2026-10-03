"use client";
import Link from "next/link";
import React from "react";
import { ChevronRight, FileText, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import AccountStatusBanner from "@/app/(dashboards)/vendor/_components/AccountStatusBanner";
import { getProfileCompleteness } from "@/app/(dashboards)/vendor/_components/profileCompleteness";

// Runs from a soft step of the sign-in panel's navy into the brand blue of
// the buttons, so it ties the two together without a heavy dark block
const bannerStyle =
  "rounded-xl bg-gradient-to-r from-navy-soft to-primary text-white/85 shadow-sm";

// An outline with a gap shows on both the navy and the blue end
const focusOnBanner =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

// White leads; the outline button sits beside it at the same height
const solidOnBannerStyle = cn(
  "inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-4 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-white/90",
  focusOnBanner
);
const outlineOnBannerStyle = cn(
  "inline-flex h-9 items-center rounded-lg border border-white/40 px-4 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/10",
  focusOnBanner
);
const linkOnBannerStyle = cn(
  "rounded-sm font-medium text-white underline-offset-2 hover:underline",
  focusOnBanner
);

interface BannerStat {
  value: number;
  label: string;
}

/** Row of headline counts under the hero copy. */
const BannerStats = ({ stats }: { stats: BannerStat[] }) => (
  <dl className='flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/15 pt-4'>
    {stats.map((stat) => (
      <div key={stat.label}>
        <dt className='text-xs uppercase tracking-wider text-white/80'>
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
        className={cn(linkOnBannerStyle, "underline hover:no-underline")}>
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
      <div className={bannerStyle}>
        <div className='space-y-4 px-4 py-4 md:px-6'>
          <div className='flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center'>
            {/* Welcome message */}
            <div className='flex items-center gap-3'>
              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10'>
                <User
                  className='h-4 w-4 text-white'
                  aria-hidden='true'
                />
              </div>
              <div>
                <h2 className='text-sm font-semibold text-white'>
                  Welcome back, {userName}!
                </h2>
                <p className='text-xs'>
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
              <Link
                href={isVendor ? "/vendor/purchased" : "/admin/bids"}
                className={cn(solidOnBannerStyle, "h-8 px-3 text-xs")}>
                <FileText
                  className='h-3.5 w-3.5'
                  aria-hidden='true'
                />
                {isVendor ? "My Bids" : "Manage Bids"}
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

  // Unauthenticated user banner - kept short so tenders show above the fold
  return (
    <div className={cn(bannerStyle, "mb-5")}>
      <div className='space-y-4 px-5 py-5 md:px-7 md:py-6'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='min-w-0'>
            <h1 className='text-xl font-bold leading-tight tracking-tight text-white md:text-2xl'>
              TERI Official eTender Portal
            </h1>
            <p className='mt-1.5 max-w-xl text-sm leading-relaxed'>
              Discover and bid on TERI tenders for sustainable development,
              energy research and environmental projects.
            </p>
          </div>

          <div className='flex shrink-0 flex-wrap items-center gap-2.5'>
            <Link
              href='/register'
              className={solidOnBannerStyle}>
              Register Now
            </Link>
            <Link
              href='/sign-in'
              className={outlineOnBannerStyle}>
              Sign In
            </Link>
            <Link
              href='/about'
              className={cn(
                linkOnBannerStyle,
                "group ml-1 flex items-center text-sm"
              )}>
              Learn more
              <ChevronRight
                className='ml-0.5 h-4 w-4 transition-transform group-hover:translate-x-0.5'
                aria-hidden='true'
              />
            </Link>
          </div>
        </div>

        <HomeBannerStats />
      </div>
    </div>
  );
};

export default HomeBanner;
