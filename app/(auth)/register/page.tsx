import Registration from "@/app/(auth)/register/_components/Registration";
import { Suspense } from "react";
import { ShieldCheck, Clock } from "lucide-react";
import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo.config";

export const metadata: Metadata = generatePageMetadata(
  "Vendor Registration",
  "Register your company as a vendor on the TERI eTender Portal to receive tender updates, buy tender documents and submit bids online.",
  "/register",
  ["TERI vendor registration", "TERI tender registration", "Vendor Registration"]
);

const VendorRegistration = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Hero Header Section */}
      <div className='mx-auto px-6 lg:px-12 py-7 lg:py-8 flex items-center justify-center'>
        <div className='max-w-4xl flex items-center justify-center flex-col'>
          <h1 className='text-sky-700 text-xl lg:text-2xl font-semibold text-foreground mb-3 tracking-tight'>
            Vendor Registration
          </h1>
          <p className='text-sm text-gray-500 max-w-2xl leading-relaxed'>
            Please provide all necessary details to register your company as a
            vendor.
          </p>
          <p className='text-sm text-gray-500 max-w-2xl leading-relaxed'>
            Our step-by-step form will help you complete the registration
            quickly and easily.
          </p>

          {/* Feature badges */}
          <div className='flex text-gray-500 flex-wrap gap-4 mt-4'>
            <div
              className='flex items-center gap-2
              border border-primary/30 rounded-full px-3 py-1.5 text-sm text-muted-foreground bg-primary/10'>
              <ShieldCheck size={12} />
              <span className='text-xs'>Secure & Encrypted</span>
            </div>
            <div className='flex items-center gap-2 rounded-full px-3 py-1.5 border border-primary/30 text-sm text-muted-foreground bg-primary/10'>
              <Clock size={12} />
              <span className='text-xs'>~10 min to complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=' lg:pb-12'>
        <Suspense>
          <Registration />
        </Suspense>
      </div>
    </div>
  );
};

export default VendorRegistration;
