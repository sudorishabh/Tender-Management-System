"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import HeaderSkeleton from "../Shared/skeleton/HeaderSkeleton";
import CustomButton from "../Shared/CustomButton";
import useLogout from "@/hooks/useLogout";
import { getRoleDashboard } from "@/lib/auth/types";
import type { DbRole } from "@/lib/auth/types";

/**
 * Dashboard sections render their own sidebar and page chrome, so the global
 * header is suppressed there rather than stacking two navigations.
 */
const DASHBOARD_PREFIXES = ["/admin", "/vendor", "/super"];

const isDashboardRoute = (pathname: string | null) =>
  !!pathname &&
  DASHBOARD_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

// TERI is the parent organisation, so the product name sits beside its logo
// to make clear this site is TERI's eTender portal, not TERI itself
const BrandLockup = () => (
  <>
    {process.env.NEXT_PUBLIC_APP_NAME === "TERI" ? (
      <Image
        src='/TERI_LOGO.png'
        alt=''
        height={120}
        width={120}
        className='w-10 h-9 md:w-12 md:h-11'
      />
    ) : (
      <span className='text-navy text-2xl font-bold'>TERI</span>
    )}
    <span
      aria-hidden
      className='h-7 md:h-8 w-px bg-gray-200'
    />
    <span className='flex flex-col leading-tight whitespace-nowrap'>
      <span className='text-[13px] sm:text-sm md:text-base font-semibold text-navy'>
        eTender Portal
      </span>
      <span className='hidden sm:block text-[11px] text-text-secondary-color'>
        The Energy and Resources Institute
      </span>
    </span>
  </>
);

const Header = () => {
  const { data: session, status } = useSession();
  const { logout, isLoggingOut } = useLogout();
  const pathname = usePathname();

  const user = session?.user as any;
  const role = user?.role;
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  if (isDashboardRoute(pathname)) return null;

  return (
    <header
      role='banner'
      aria-label='Main navigation'
      className={cn(
        "fixed border-b-[0.1rem]  border-gray-200 backdrop-blur-s bg-white top-0 left-0 flex items-center w-full px-4 sm:px-9 py-2 md:px-8 md:py-0 lg:px-16 z-[50] h-12 md:h-14"
      )}>
      <nav
        className='flex justify-between items-center w-full'
        aria-label='Primary navigation'>
        <Link
          href='/'
          aria-label='TERI eTender Portal home'
          className='flex items-center gap-2 md:gap-3'>
          <BrandLockup />
        </Link>

        <div className='flex items-center gap-2 md:gap-4 font-medium text-text-secondary-color'>
          {!isLoading ? (
            <>
              {isAuthenticated ? (
                <Link href={getRoleDashboard(role as DbRole)}>
                  <Button
                    className={cn(
                      "h-8 md:h-8 flex items-center gap-1 text-primary shadow-none rounded-md bg-white",
                      "border-gray-200 hover:bg-gray-100 hover:border-gray-100 ",
                      "transition-all duration-300 text-xs md:text-xs px-0 md:px-2"
                    )}>
                    <LayoutDashboard className='!size-3.5' />
                    {role === "vendor"
                      ? "Dashboard"
                      : role === "admin"
                      ? "Admin Dashboard"
                      : role === "super_admin"
                      ? "S. Admin Dashboard"
                      : "Vendor Board"}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href={"/sign-in"}>
                    <CustomButton
                      variant='tertiary'
                      btnName='Sign In'
                    />
                  </Link>
                  <Link href={"/register"}>
                    <CustomButton
                      variant='primary'
                      btnName='Register Now'
                    />
                  </Link>
                </>
              )}
            </>
          ) : (
            <HeaderSkeleton />
          )}
          {isAuthenticated && (
            <button
              className='bg-gray-100/70 hover:bg-red-50 p-2 rounded-lg transition duration-300 ease-in-out group'
              onClick={logout}
              disabled={isLoggingOut}
              aria-label='Sign out'>
              {isLoggingOut ? (
                <div className='w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin'></div>
              ) : (
                <LogOut
                  size={16}
                  className='group-hover:text-red-600 text-gray-500'
                />
              )}
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
