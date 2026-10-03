import React from "react";
import { Metadata } from "next";
import {
  generatePageMetadata,
  BASE_URL,
  sharedOpenGraph,
} from "@/lib/seo.config";
import { generateBreadcrumbSchema } from "@/lib/structured-data";
import { JsonLdScript } from "@/_components/SEO/JsonLd";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { surfaceStyle } from "@/app/styles";
import { allFaqs, faqGroups } from "@/lib/faqs";

export const metadata: Metadata = {
  ...generatePageMetadata(
    "Frequently Asked Questions - TERI Tender Portal",
    "Find answers to common questions about TERI tenders, vendor registration, bid submission, and e-procurement process. Learn how to participate in TERI tender opportunities.",
    "/faq",
    [
      "TERI tender FAQ",
      "TERI tender questions",
      "how to apply TERI tender",
      "TERI vendor registration help",
      "TERI bid submission guide",
      "TERI procurement FAQ",
      "tender portal help",
      "e-tender questions India",
    ]
  ),
  openGraph: {
    ...sharedOpenGraph,
    title: "TERI Tender FAQ - Frequently Asked Questions",
    description:
      "Get answers to common questions about TERI tenders, registration, and bidding process.",
    url: `${BASE_URL}/faq`,
    type: "website",
  },
};

const contactLinkStyle =
  "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:border-primary hover:text-primary";

const FAQPage = () => {
  // Enhanced FAQ schema with all questions
  const enhancedFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: BASE_URL },
    { name: "FAQ", url: `${BASE_URL}/faq` },
  ]);

  return (
    // Same tinted canvas as the home page and dashboards; flow-root keeps the
    // inner margins inside the tinted area
    <div className='flow-root min-h-svh bg-canvas'>
      <JsonLdScript data={[enhancedFaqSchema, breadcrumbSchema]} />

      {/* pt clears the fixed header, which is h-12 on mobile / h-14 from md */}
      <div className='mx-auto max-w-5xl px-4 pb-16 pt-20 md:pt-24'>
        <nav
          aria-label='Breadcrumb'
          className='mb-4 text-xs'>
          <ol className='flex items-center gap-1.5 text-slate-500'>
            <li>
              <Link
                href='/'
                className='hover:text-primary hover:underline'>
                Home
              </Link>
            </li>
            <li aria-hidden='true'>
              <ChevronRight className='size-3.5' />
            </li>
            <li
              aria-current='page'
              className='text-slate-700'>
              FAQ
            </li>
          </ol>
        </nav>

        <header className='mb-8'>
          <h1 className='text-2xl font-bold text-slate-900 md:text-3xl'>
            Frequently asked questions
          </h1>
          <p className='mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base'>
            How registration, payments and bidding work on the TERI eTender
            portal.
          </p>
        </header>

        <div className='grid gap-8 lg:grid-cols-[12rem_minmax(0,1fr)]'>
          {/* Section links on desktop; phones just scroll the short list */}
          <nav
            aria-label='FAQ sections'
            className='hidden lg:block'>
            <div className='sticky top-20'>
              <p className='mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                On this page
              </p>
              <ul className='space-y-0.5'>
                {faqGroups.map((group) => (
                  <li key={group.id}>
                    <a
                      href={`#${group.id}`}
                      className='block rounded-md px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-white hover:text-primary'>
                      {group.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className='space-y-8'>
            {faqGroups.map((group) => (
              <section
                key={group.id}
                id={group.id}
                aria-labelledby={`${group.id}-heading`}
                className='scroll-mt-20'>
                <h2
                  id={`${group.id}-heading`}
                  className='mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  {group.title}
                </h2>
                <div
                  className={cn(
                    surfaceStyle,
                    "divide-y divide-slate-100 overflow-hidden"
                  )}>
                  {group.faqs.map((faq) => (
                    <details
                      key={faq.id}
                      id={faq.id}
                      className='group scroll-mt-20'>
                      <summary className='flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50 group-open:text-primary [&::-webkit-details-marker]:hidden'>
                        {faq.question}
                        <ChevronDown
                          aria-hidden='true'
                          className='size-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180 group-open:text-primary'
                        />
                      </summary>
                      <p className='px-5 pb-4 text-sm leading-relaxed text-slate-600'>
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            ))}

            <section
              aria-labelledby='faq-help-heading'
              className={cn(surfaceStyle, "p-5 md:p-6")}>
              <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                <div>
                  <h2
                    id='faq-help-heading'
                    className='flex items-center gap-2 text-base font-semibold text-slate-900'>
                    <MessageSquare
                      aria-hidden='true'
                      className='size-4 text-primary'
                    />
                    Still have a question?
                  </h2>
                  <p className='mt-1 text-sm text-slate-600'>
                    The tender team can help with registration, payments and
                    bids.
                  </p>
                  <p className='mt-2 text-xs text-slate-500'>
                    New here?{" "}
                    <Link
                      href='/register'
                      className='font-medium text-primary hover:underline'>
                      Register as a vendor
                    </Link>{" "}
                    or read{" "}
                    <Link
                      href='/about'
                      className='font-medium text-primary hover:underline'>
                      about the portal
                    </Link>
                    .
                  </p>
                </div>
                {/* Stacked at an equal width beside the text on desktop */}
                <div className='flex flex-col gap-2 sm:flex-row md:shrink-0 md:flex-col'>
                  <a
                    href='tel:+918560064756'
                    className={contactLinkStyle}>
                    <Phone
                      aria-hidden='true'
                      className='size-4 text-primary'
                    />
                    +91 8560064756
                  </a>
                  <a
                    href='mailto:etender@teri.res.in'
                    className={contactLinkStyle}>
                    <Mail
                      aria-hidden='true'
                      className='size-4 text-primary'
                    />
                    etender@teri.res.in
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
