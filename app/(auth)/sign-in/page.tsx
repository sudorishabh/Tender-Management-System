"use client";

import React, { Suspense } from "react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { surfaceStyle } from "@/app/styles";
import SignInForm from "./_components/SignInForm";

// Shown after an invited admin finishes setting up their account
const AccountCreatedNotice = () => {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  if (message !== "account-created") return null;

  return (
    <div
      role='status'
      className='mb-4 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4'>
      <CheckCircle
        className='mt-0.5 size-5 shrink-0 text-green-600'
        aria-hidden='true'
      />
      <div>
        <p className='text-sm font-medium text-green-900'>Account created</p>
        <p className='mt-0.5 text-sm text-green-800'>
          Your admin account is ready. Sign in with your email address and the
          password you just set.
        </p>
      </div>
    </div>
  );
};

const SignIn = () => {
  return (
    // The auth layout already pads 3.5rem for the fixed header, so fill only
    // the rest of the screen; min-h-screen here always scrolled by that much
    <div className='flex min-h-[calc(100svh-3.5rem)] items-center justify-center bg-slate-50 px-4 py-10'>
      <div className='w-full max-w-md'>
        <Suspense fallback={null}>
          <AccountCreatedNotice />
        </Suspense>

        <div className={cn(surfaceStyle, "overflow-hidden")}>
          <div className='p-6 sm:p-8'>
            <h1 className='text-xl font-semibold text-slate-900'>Sign in</h1>
            <p className='mt-1 text-sm text-slate-600'>
              Use the email address and password of your TERI eTender account.
            </p>

            <div className='mt-6'>
              <SignInForm />
            </div>
          </div>

          {/* Only vendors register here; TERI staff join by invitation */}
          <p className='border-t border-slate-100 bg-slate-50/60 px-6 py-4 text-center text-sm text-slate-600 sm:px-8'>
            New to the portal?{" "}
            <Link
              href='/register'
              className='font-medium text-primary hover:underline'>
              Register as a vendor
            </Link>
          </p>
        </div>

        {/* There's no self-service password reset, so point to the people
            who can help */}
        <p className='mt-6 text-center text-xs leading-relaxed text-slate-500'>
          Can&apos;t sign in? Contact the tender team at{" "}
          <a
            href='mailto:etender@teri.res.in'
            className='font-medium text-slate-700 hover:text-primary hover:underline'>
            etender@teri.res.in
          </a>{" "}
          or{" "}
          <a
            href='tel:+918560064756'
            className='whitespace-nowrap font-medium text-slate-700 hover:text-primary hover:underline'>
            +91 8560064756
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default SignIn;
