"use client";
import React, { useId, useState } from "react";
import { useSession } from "next-auth/react";
import {
  MessageSquare,
  Phone,
  Mail,
  ChevronDown,
  HelpCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";

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

  return (
    <div className='w-full space-y-6 lg:w-64 xl:w-80'>
      {/* Support/Help Card - contact details lead, they are the more
          actionable of the two panels */}
      <div className='overflow-hidden rounded-md border border-gray-300'>
        <div className='flex items-center border-b border-gray-200 bg-primary/5 px-5 py-4'>
          <div className='mr-2.5 rounded-md bg-primary/10 p-1.5'>
            <MessageSquare
              className='h-4 w-4 text-primary'
              aria-hidden='true'
            />
          </div>
          <h3 className='text-sm font-semibold text-gray-800'>Need Help?</h3>
        </div>

        <div className='divide-y divide-gray-200'>
          <p className='px-5 py-3 text-sm text-gray-600'>
            Our support team is available to assist you with any questions.
          </p>

          <a
            href='tel:+918560064756'
            className='flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50'>
            <Phone
              className='h-4 w-4 shrink-0 text-primary'
              aria-hidden='true'
            />
            <span className='min-w-0'>
              <span className='block text-xs text-gray-500'>Call Support</span>
              <span className='block text-sm font-medium text-gray-700'>
                +91 8560064756
              </span>
            </span>
          </a>

          <a
            href='mailto:etender@teri.res.in'
            className='flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50'>
            <Mail
              className='h-4 w-4 shrink-0 text-primary'
              aria-hidden='true'
            />
            <span className='min-w-0'>
              <span className='block text-xs text-gray-500'>Email Support</span>
              <span className='block truncate text-sm font-medium text-gray-700'>
                etender@teri.res.in
              </span>
            </span>
          </a>
        </div>
      </div>

      {/* FAQ Card */}
      <div className='overflow-hidden rounded-md border border-gray-300'>
        <div className='flex items-center border-b border-gray-200 bg-primary/5 px-5 py-4'>
          <div className='mr-2.5 rounded-md bg-primary/10 p-1.5'>
            <HelpCircle
              className='h-4 w-4 text-primary'
              aria-hidden='true'
            />
          </div>
          <h3 className='text-sm font-semibold text-gray-800'>
            Frequently Asked Questions
          </h3>
        </div>

        <div className='divide-y divide-gray-200'>
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
                    className='flex w-full items-center justify-between gap-2 px-5 py-3 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50'>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isOpen ? "text-primary" : "text-gray-700"
                      )}>
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200",
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
                  <p className='px-5 pb-3 text-sm leading-relaxed text-gray-600'>
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomeRightSection;
