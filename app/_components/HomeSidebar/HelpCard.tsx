"use client";
import React, { useId, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  MessageSquare,
  Phone,
  Mail,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { surfaceStyle } from "@/app/styles";
import { pickFaqs } from "@/lib/faqs";

// Same answers as the FAQ page. Signed-in vendors are past registration,
// so they get account questions instead
const visitorFaqIds = ["register", "bid-documents", "track-bids", "payment"];
const vendorFaqIds = [
  "cant-bid",
  "update-details",
  "bid-documents",
  "track-bids",
  "payment",
];

const ContactLink = ({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: string;
}) => (
  <a
    href={href}
    className='flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-slate-50'>
    <Icon
      className='size-4 shrink-0 text-primary'
      aria-hidden='true'
    />
    <span className='min-w-0'>
      <span className='block text-xs text-slate-500'>{label}</span>
      <span className='block truncate text-sm font-medium text-slate-800'>
        {value}
      </span>
    </span>
  </a>
);

/** Support contacts and the FAQs that fit the signed-in role. */
const HelpCard = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqId = useId();
  const { data: session } = useSession();

  const faqs = pickFaqs(
    session?.user?.role === "vendor" ? vendorFaqIds : visitorFaqIds
  );

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Contacts lead as the more actionable part, FAQs follow
  return (
    <section className={cn(surfaceStyle, "overflow-hidden")}>
      <div className='flex items-center gap-2 border-b border-slate-100 px-5 py-3.5'>
        <MessageSquare
          className='size-4 text-primary'
          aria-hidden='true'
        />
        <h2 className='text-sm font-semibold text-slate-900'>Need help?</h2>
      </div>

      <div className='py-1.5'>
        <ContactLink
          href='tel:+918560064756'
          icon={Phone}
          label='Call support'
          value='+91 8560064756'
        />
        <ContactLink
          href='mailto:etender@teri.res.in'
          icon={Mail}
          label='Email support'
          value='etender@teri.res.in'
        />
      </div>

      <h3 className='border-t border-slate-100 px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-500'>
        Frequently asked questions
      </h3>
      <div className='divide-y divide-slate-100'>
        {faqs.map((faq, index) => {
          const isOpen = openFaq === index;
          return (
            <div key={faq.question}>
              <h4>
                <button
                  type='button'
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  aria-controls={`${faqId}-panel-${index}`}
                  id={`${faqId}-trigger-${index}`}
                  className='flex w-full items-center justify-between gap-2 px-5 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50'>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isOpen ? "text-primary" : "text-slate-700"
                    )}>
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
                      isOpen && "rotate-180 text-primary"
                    )}
                    aria-hidden='true'
                  />
                </button>
              </h4>
              <div
                id={`${faqId}-panel-${index}`}
                role='region'
                aria-labelledby={`${faqId}-trigger-${index}`}
                hidden={!isOpen}>
                <p className='px-5 pb-3 text-sm leading-relaxed text-slate-600'>
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* The FAQ page answers more than fits here */}
      <Link
        href='/faq'
        className='flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs font-medium text-primary transition-colors hover:bg-slate-50'>
        See all FAQs
        <ChevronRight
          className='size-3.5'
          aria-hidden='true'
        />
      </Link>
    </section>
  );
};

export default HelpCard;
