import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata, BASE_URL } from "@/lib/seo.config";

export const metadata: Metadata = {
  ...generatePageMetadata(
    "About TERI Tenders",
    "Learn about TERI's eTender Management System. We provide a transparent, efficient, and secure platform for government and private sector procurement in India.",
    "/about",
    [
      "About TERI Tenders",
      "TERI Procurement",
      "eTender Platform India",
      "Government Tender Portal",
      "Sustainable Procurement",
    ],
  ),
  openGraph: {
    title: "About TERI Tenders - India's Trusted eTender Platform",
    description:
      "Learn about TERI's commitment to transparent and efficient procurement through our eTender Management System.",
    url: `${BASE_URL}/about`,
    type: "website",
    images: [
      {
        url: `${BASE_URL}/TERI_LOGO.png`,
        width: 512,
        height: 512,
        alt: "TERI Logo",
      },
    ],
  },
};

const AboutPage = () => {
  return (
    <div className='pt-16 min-h-screen bg-gradient-to-b from-gray-50 to-white'>
      {/* Hero Section */}
      {/* Same navy-to-blue blend as the home banner */}
      <div className='bg-gradient-to-r from-navy-soft to-primary'>
        <div className='max-w-6xl mx-auto px-4 py-16 md:py-20'>
          <h1 className='text-3xl md:text-5xl font-bold tracking-tight text-white mb-4'>
            About TERI Tenders
          </h1>
          <p className='text-white/85 text-lg md:text-xl max-w-3xl leading-relaxed'>
            India&apos;s premier eTender management platform for sustainable
            development and environmental excellence
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-6xl mx-auto px-4 py-12 md:py-16'>
        {/* About TERI Section */}
        <section className='mb-16'>
          <div className='bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden'>
            <div className='p-6 md:p-8'>
              <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4'>
                The Energy and Resources Institute (TERI)
              </h2>
              <div className='space-y-4 text-gray-600 leading-relaxed'>
                <p>
                  TERI Tenders is the official eTender Management System of The
                  Energy and Resources Institute (TERI), one of India&apos;s
                  leading research organizations dedicated to sustainable
                  development, energy solutions, and environmental conservation.
                </p>
                <p>
                  For over five decades, TERI has been at the forefront of
                  sustainability research and innovation. Our eTender platform
                  extends this commitment by providing a transparent, efficient,
                  and secure procurement system that serves both government and
                  private sector organizations across India.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className='mb-16'>
          <div className='grid md:grid-cols-2 gap-6'>
            <div className='bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg shadow-md border border-primary/20 p-6 md:p-8'>
              <div className='bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4'>
                <svg
                  className='w-6 h-6 text-primary'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 10V3L4 14h7v7l9-11h-7z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>
                Our Mission
              </h3>
              <p className='text-gray-600 leading-relaxed'>
                To provide a transparent, efficient, and secure platform for
                procurement, enabling organizations to publish tenders and
                vendors to participate in the bidding process seamlessly while
                maintaining the highest standards of integrity and fairness.
              </p>
            </div>

            <div className='bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg shadow-md border border-blue-200/50 p-6 md:p-8'>
              <div className='bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4'>
                <svg
                  className='w-6 h-6 text-blue-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>
                Our Vision
              </h3>
              <p className='text-gray-600 leading-relaxed'>
                To become India&apos;s most trusted and technologically advanced
                tender management platform, fostering sustainable business
                practices and empowering organizations and vendors across all
                sectors.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className='mb-16'>
          <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center'>
            Why Choose TERI Tenders?
          </h2>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[
              {
                icon: (
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                    />
                  </svg>
                ),
                title: "Secure & Reliable",
                desc: "Bank-grade security with encrypted data storage and secure document management",
              },
              {
                icon: (
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                    />
                  </svg>
                ),
                title: "Transparent Process",
                desc: "Complete transparency in bidding with fair evaluation and real-time status updates",
              },
              {
                icon: (
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 10V3L4 14h7v7l9-11h-7z'
                    />
                  </svg>
                ),
                title: "Fast & Efficient",
                desc: "Streamlined workflow reducing procurement cycle time significantly",
              },
              {
                icon: (
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                    />
                  </svg>
                ),
                title: "Real-time Notifications",
                desc: "Instant alerts for new tenders, bid updates, and important announcements",
              },
              {
                icon: (
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                ),
                title: "Document Management",
                desc: "Easy upload, storage, and retrieval of all tender-related documents",
              },
              {
                icon: (
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
                    />
                  </svg>
                ),
                title: "Easy Registration",
                desc: "Simple vendor registration process with quick verification and approval",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className='bg-white rounded-lg shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow'>
                <div className='bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-primary'>
                  {feature.icon}
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>
                  {feature.title}
                </h3>
                <p className='text-gray-600 text-sm leading-relaxed'>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Who Can Use */}
        <section className='mb-16'>
          <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center'>
            Who Can Use TERI Tenders?
          </h2>
          <div className='grid md:grid-cols-2 gap-6'>
            <div className='bg-white rounded-lg shadow-md border border-gray-100 p-6 md:p-8'>
              <div className='flex items-start'>
                <div className='bg-primary/10 p-3 rounded-lg mr-4'>
                  <svg
                    className='w-8 h-8 text-primary'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className='text-xl font-bold text-gray-900 mb-3'>
                    For Organizations
                  </h3>
                  <ul className='space-y-2 text-gray-600'>
                    <li className='flex items-start'>
                      <span className='text-primary mr-2'>•</span>
                      <span>Publish and manage tenders efficiently</span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-primary mr-2'>•</span>
                      <span>Receive and evaluate bids systematically</span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-primary mr-2'>•</span>
                      <span>Track tender status and manage workflows</span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-primary mr-2'>•</span>
                      <span>Ensure compliance and transparency</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow-md border border-gray-100 p-6 md:p-8'>
              <div className='flex items-start'>
                <div className='bg-blue-100 p-3 rounded-lg mr-4'>
                  <svg
                    className='w-8 h-8 text-blue-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className='text-xl font-bold text-gray-900 mb-3'>
                    For Vendors
                  </h3>
                  <ul className='space-y-2 text-gray-600'>
                    <li className='flex items-start'>
                      <span className='text-blue-600 mr-2'>•</span>
                      <span>Browse and search available tenders</span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-blue-600 mr-2'>•</span>
                      <span>Submit bids online with ease</span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-blue-600 mr-2'>•</span>
                      <span>Track bid status in real-time</span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-blue-600 mr-2'>•</span>
                      <span>Manage documents and communications</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className='mb-16'>
          <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center'>
            How It Works
          </h2>
          <div className='bg-white rounded-lg shadow-md border border-gray-100 p-6 md:p-8'>
            <div className='space-y-6'>
              {[
                {
                  step: "1",
                  title: "Register",
                  desc: "Create your account as a vendor or organization with necessary details and documents",
                },
                {
                  step: "2",
                  title: "Discover Tenders",
                  desc: "Browse or search for relevant tenders matching your business profile and capabilities",
                },
                {
                  step: "3",
                  title: "Submit Bid",
                  desc: "Prepare and submit your bid with all required documents before the deadline",
                },
                {
                  step: "4",
                  title: "Track Status",
                  desc: "Monitor your bid status and receive updates throughout the evaluation process",
                },
                {
                  step: "5",
                  title: "Award & Execute",
                  desc: "Successful bidders receive award notifications and proceed with contract execution",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className='flex items-start'>
                  <div className='flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mr-4'>
                    {item.step}
                  </div>
                  <div className='flex-1'>
                    <h3 className='text-lg font-bold text-gray-900 mb-1'>
                      {item.title}
                    </h3>
                    <p className='text-gray-600'>{item.desc}</p>
                  </div>
                  {idx < 4 && (
                    <div className='hidden md:block ml-4'>
                      <svg
                        className='w-6 h-6 text-primary/30'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 9l-7 7-7-7'
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact & Support */}
        <section className='mb-16'>
          <div className='bg-gradient-to-r from-navy-soft to-primary rounded-lg shadow-sm overflow-hidden'>
            <div className='p-6 md:p-8 text-white'>
              <h2 className='text-2xl md:text-3xl font-bold mb-4'>
                Need Help?
              </h2>
              <p className='text-white/85 mb-6 max-w-2xl'>
                Our dedicated support team is here to assist you with any
                questions or concerns about the tender process, registration, or
                technical issues.
              </p>
              <div className='grid md:grid-cols-2 gap-6'>
                <div className='bg-white/5 rounded-lg p-4 border border-white/10'>
                  <div className='flex items-center mb-2'>
                    <svg
                      className='w-5 h-5 mr-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                      />
                    </svg>
                    <span className='font-medium'>Phone Support</span>
                  </div>
                  <a
                    href='tel:+918560064756'
                    className='text-lg font-bold hover:text-white/80'>
                    +91 8560064756
                  </a>
                </div>
                <div className='bg-white/5 rounded-lg p-4 border border-white/10'>
                  <div className='flex items-center mb-2'>
                    <svg
                      className='w-5 h-5 mr-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      />
                    </svg>
                    <span className='font-medium'>Email Support</span>
                  </div>
                  <a
                    href='mailto:support@teri.res.in'
                    className='text-lg font-bold hover:text-white/80'>
                    support@teri.res.in
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className='text-center'>
          <div className='bg-gray-50 rounded-lg border border-gray-200 p-8 md:p-12'>
            <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4'>
              Ready to Get Started?
            </h2>
            <p className='text-gray-600 mb-6 max-w-2xl mx-auto'>
              Join thousands of organizations and vendors who trust TERI Tenders
              for their procurement needs.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <a
                href='/register'
                className='inline-block px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary-hover transition-colors'>
                Register Now
              </a>
              <Link
                href='/'
                className='inline-block px-8 py-3 bg-white text-primary font-semibold rounded-lg border-2 border-primary hover:bg-primary/5 transition-colors'>
                Browse Tenders
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
