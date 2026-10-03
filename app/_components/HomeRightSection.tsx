"use client";
import React, { useId, useState } from "react";
import { useSession } from "next-auth/react";
import {
  MessageSquare,
  Phone,
  Mail,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { surfaceStyle } from "@/app/styles";

const registerFaq = {
  question: "How do I register as a vendor?",
  answer:
    "Click on 'Register Now' and fill in your company details. You'll receive a verification email to complete the registration process.",
};

// Signed-in vendors are past registration, so they get account questions
const vendorAccountFaqs = [
  {
    question: "Why can't I submit a bid yet?",
    answer:
      "Only approved accounts can submit bids. While your registration is pending, you can still browse tenders. Your account status is shown on your profile page.",
  },
  {
    question: "How do I update my business details?",
    answer:
      "Open your profile from the dashboard and choose Edit profile. Documents uploaded during registration can't be changed there, so contact the tender team to replace one.",
  },
];

const commonFaqs = [
  {
    question: "What documents do I need to bid?",
    answer:
      "Required documents vary by tender but typically include company registration, PAN card, GST certificate, and relevant experience certificates.",
  },
  {
    question: "How can I track my bids?",
    answer:
      "Once logged in, visit your dashboard to view all your submitted bids, their status, and any updates from the tender management team.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept online payments via net banking, credit/debit cards, and UPI. Detailed payment instructions are provided during the bidding process.",
  },
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

const HomeRightSection = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqId = useId();
  const { data: session } = useSession();

  const faqs =
    session?.user?.role === "vendor"
      ? [...vendorAccountFaqs, ...commonFaqs]
      : [registerFaq, ...commonFaqs];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // One panel: contacts lead as the more actionable part, FAQs follow
  return (
    <div className='w-full lg:w-64 xl:w-80'>
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
        <div className='divide-y divide-slate-100 pb-1'>
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
      </section>
    </div>
  );
};

export default HomeRightSection;
