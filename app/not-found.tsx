import Link from "next/link";
import { Button } from "@/_components/ui/button";
import { Metadata } from "next";
import { Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The page you are looking for does not exist on TERI Tenders. Return to homepage to browse available tenders.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4'>
      <div className='flex flex-col items-center gap-5 text-center max-w-md'>
        {/* 404 Number */}
        <h1 className='text-7xl font-bold text-primary'>404</h1>

        {/* Title */}
        <h2 className='text-2xl font-semibold text-gray-900'>Page Not Found</h2>

        {/* Description */}
        <p className='text-gray-600'>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action Button */}
        <Button
          asChild
          className='mt-2'>
          <Link
            href='/'
            className='flex items-center gap-2'>
            <Home className='w-4 h-4' />
            Go to Homepage
          </Link>
        </Button>

        {/* Contact */}
        <p className='text-sm text-gray-500 mt-4'>
          Need help?{" "}
          <a
            href='mailto:etender@teri.res.in'
            className='text-primary hover:underline'>
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
