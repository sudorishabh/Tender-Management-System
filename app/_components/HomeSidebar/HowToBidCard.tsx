import React from "react";
import Link from "next/link";
import { ChevronRight, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { surfaceStyle } from "@/app/styles";

// Mirrors the real flow: registration review, then the payment receipt the
// bid form asks for. Payment methods follow the tender page's instructions.
const steps = [
  {
    title: "Register your business",
    detail:
      "It's free. Add your company details with your GST, PAN and registration documents.",
  },
  {
    title: "Get approved",
    detail: "TERI verifies your account. Only approved vendors can bid.",
  },
  {
    title: "Pay the fee and EMD",
    detail:
      "The fee by bank cheque and the EMD by demand draft, as set out on the tender. Keep the receipt.",
  },
  {
    title: "Submit your bid",
    detail:
      "Upload the receipt and the required documents before the deadline.",
  },
];

/** The bidding process at a glance, for visitors who haven't signed up. */
const HowToBidCard = () => (
  <section className={cn(surfaceStyle, "overflow-hidden")}>
    <header className='flex items-center gap-2 border-b border-slate-100 px-5 py-3.5'>
      <ListChecks
        aria-hidden
        className='size-4 text-primary'
      />
      <h2 className='text-sm font-semibold text-slate-900'>How to bid</h2>
    </header>

    <ol className='space-y-3.5 px-5 py-4'>
      {steps.map((step, index) => (
        <li
          key={step.title}
          className='flex gap-3'>
          <span
            aria-hidden
            className='flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary'>
            {index + 1}
          </span>
          <div className='min-w-0'>
            <p className='text-sm font-medium text-slate-900'>{step.title}</p>
            <p className='text-xs leading-relaxed text-slate-500'>
              {step.detail}
            </p>
          </div>
        </li>
      ))}
    </ol>

    <Link
      href='/register'
      className='flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs font-medium text-primary transition-colors hover:bg-slate-50'>
      Register now
      <ChevronRight
        className='size-3.5'
        aria-hidden='true'
      />
    </Link>
  </section>
);

export default HowToBidCard;
