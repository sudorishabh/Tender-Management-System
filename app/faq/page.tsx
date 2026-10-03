import React from "react";
import { Metadata } from "next";
import { generatePageMetadata, BASE_URL } from "@/lib/seo.config";
import { generateBreadcrumbSchema } from "@/lib/structured-data";
import { JsonLdScript } from "@/_components/SEO/JsonLd";
import Link from "next/link";
import { allFaqs } from "@/lib/faqs";

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
    title: "TERI Tender FAQ - Frequently Asked Questions",
    description:
      "Get answers to common questions about TERI tenders, registration, and bidding process.",
    url: `${BASE_URL}/faq`,
    type: "website",
  },
};

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
    <div className='pt-16 min-h-screen bg-gray-50'>
      {/* Structured Data */}
      <JsonLdScript data={[enhancedFaqSchema, breadcrumbSchema]} />

      <div className='max-w-4xl mx-auto px-4 py-12'>
        {/* Breadcrumb */}
        <nav
          className='text-sm mb-6'
          aria-label='Breadcrumb'>
          <ol className='flex items-center space-x-2'>
            <li>
              <Link
                href='/'
                className='text-primary hover:underline'>
                Home
              </Link>
            </li>
            <li className='text-gray-400'>/</li>
            <li className='text-gray-600'>FAQ</li>
          </ol>
        </nav>

        {/* Page Header */}
        <header className='mb-10'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>
            TERI Tender - Frequently Asked Questions
          </h1>
          <p className='text-lg text-gray-600'>
            Find answers to common questions about TERI tenders, vendor
            registration, bid submission, and the e-procurement process.
          </p>
        </header>

        {/* FAQ List */}
        <section
          aria-label='Frequently Asked Questions'
          className='space-y-6'>
          {allFaqs.map((faq) => (
            <details
              key={faq.id}
              className='bg-white rounded-lg border border-gray-200 group'>
              <summary className='px-6 py-4 cursor-pointer font-semibold text-gray-800 hover:text-primary list-none flex justify-between items-center'>
                <span>{faq.question}</span>
                <span className='text-gray-400 group-open:rotate-180 transition-transform'>
                  ▼
                </span>
              </summary>
              <div className='px-6 pb-4 text-gray-600 border-t border-gray-100 pt-4'>
                {faq.answer}
              </div>
            </details>
          ))}
        </section>

        {/* Additional Help Section */}
        <section className='mt-12 bg-primary rounded-lg p-6 border border-primary'>
          <h2 className='text-xl font-semibold text-gray-800 mb-3'>
            Still have questions about TERI Tenders?
          </h2>
          <p className='text-gray-600 mb-4'>
            Can&apos;t find what you&apos;re looking for? Our support team is here to help
            you with any queries about the TERI tender process.
          </p>
          <div className='flex flex-wrap gap-4'>
            <Link
              href='/about'
              className='inline-flex items-center px-4 py-2 bg-white border border-primary text-primary rounded-md hover:bg-primary transition-colors'>
              Learn About TERI Tenders
            </Link>
            <Link
              href='/register'
              className='inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary transition-colors'>
              Register as Vendor
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FAQPage;
