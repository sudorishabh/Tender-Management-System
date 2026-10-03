import type { Metadata, Viewport } from "next";

// Base URL for the application
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://etender.teri.res.in";

// Organization details for structured data
export const ORGANIZATION = {
  name: "TERI - The Energy and Resources Institute",
  shortName: "TERI",
  url: BASE_URL,
  logo: `${BASE_URL}/TERI_LOGO.png`,
  description:
    "TERI is a leading think tank dedicated to conducting research for sustainable development of India and the Global South.",
  foundingDate: "1974",
  address: {
    streetAddress: "Darbari Seth Block, IHC Complex, Lodhi Road",
    addressLocality: "New Delhi",
    addressRegion: "Delhi",
    postalCode: "110003",
    addressCountry: "IN",
  },
  contactPoint: {
    telephone: "+91-11-24682100",
    contactType: "customer service",
    email: "mailbox@teri.res.in",
  },
  sameAs: [
    "https://www.linkedin.com/company/the-energy-and-resources-institute",
    "https://twitter.com/teraboratory",
    "https://www.facebook.com/TERIDelhi",
  ],
};

// Default viewport configuration
export const defaultViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

// Default metadata for the entire site
export const defaultMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:
      "TERI Tenders | Official eTender Portal - The Energy and Resources Institute",
    template: "%s | TERI Tenders - Official eTender Portal",
  },
  description:
    "TERI Official eTender Portal - Submit bids, discover government & private tenders from The Energy and Resources Institute. India's trusted tender management platform for sustainable procurement, research projects & green initiatives. Register now for TERI tender notifications.",
  keywords: [
    // Primary Keywords - TERI focused
    "TERI",
    "TERI tenders",
    "TERI tender portal",
    "TERI eTender",
    "TERI bidding",
    "TERI procurement",
    "The Energy and Resources Institute tenders",
    "TERI research tenders",
    "TERI project tenders",
    "TERI contract",
    "TERI RFP",
    "TERI RFQ",

    // Primary Keywords - Tender focused
    "tender",
    "tenders",
    "eTender",
    "e-tender",
    "online tender",
    "tender portal",
    "tender management",
    "tender submission",
    "tender bidding",
    "government tender",
    "private tender",
    "open tender",
    "tender notice",
    "tender document",

    // Combined Keywords
    "TERI tender 2024",
    "TERI tender 2025",
    "TERI tender 2026",
    "TERI online tender",
    "TERI government tender",
    "TERI sustainable tender",
    "TERI green procurement",
    "TERI environment tender",
    "TERI energy tender",
    "TERI climate tender",

    // Long-tail Keywords
    "TERI tender registration",
    "how to apply TERI tender",
    "TERI vendor registration",
    "TERI tender notification",
    "TERI Delhi tender",
    "TERI India tender",
    "research institute tender India",
    "sustainability tender India",
    "environmental tender India",
    "energy research tender",

    // Industry Keywords
    "eTender Management System",
    "Tender Management System",
    "Government Tenders India",
    "Procurement Platform India",
    "Vendor Bidding Portal",
    "Online Tender Portal India",
    "Bid Management System",
    "E-Procurement India",
    "Green Procurement India",
    "Sustainable Procurement",
    "Public Tender Portal",
    "NGO tender India",
    "Think tank tender India",
  ],
  authors: [
    {
      name: "TERI - The Energy and Resources Institute",
      url: "https://www.teriin.org/",
    },
  ],
  creator: "TERI",
  publisher: "The Energy and Resources Institute",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/TERI_LOGO.png", sizes: "32x32", type: "image/png" },
      { url: "/TERI_LOGO.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/TERI_LOGO.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/TERI_LOGO.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "TERI Tenders - Official eTender Portal",
    title:
      "TERI Tenders | Official eTender Portal - The Energy and Resources Institute",
    description:
      "Official TERI eTender Portal - Discover and bid on tenders from The Energy and Resources Institute. Government & private sector procurement for sustainable development, energy research, and environmental projects in India.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "TERI Tenders - Official eTender Portal of The Energy and Resources Institute",
      },
      {
        url: `${BASE_URL}/TERI_LOGO.png`,
        width: 512,
        height: 512,
        alt: "TERI - The Energy and Resources Institute Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@teraboratory",
    creator: "@teraboratory",
    title: "TERI Tenders | Official eTender Portal",
    description:
      "Official TERI eTender Portal - Bid on tenders from The Energy and Resources Institute. Sustainable procurement for energy, environment & research projects.",
    images: [`${BASE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  category: "Business",
  classification: "Tender Management, E-Procurement, Government Tenders",
};

// Page-specific metadata generators
export const generatePageMetadata = (
  title: string,
  description: string,
  path: string,
  keywords?: string[],
): Metadata => ({
  title,
  description,
  alternates: {
    canonical: `${BASE_URL}${path}`,
  },
  openGraph: {
    title: `${title} | TERI Tenders`,
    description,
    url: `${BASE_URL}${path}`,
    type: "website",
  },
  twitter: {
    title: `${title} | TERI Tenders`,
    description,
  },
  keywords: keywords || [],
});

// Tender detail page metadata generator
export const generateTenderMetadata = (tender: {
  id: number;
  title: string;
  description?: string;
  department?: string;
  bidEndDate?: Date;
  estimatedValue?: number;
}): Metadata => ({
  title: tender.title,
  description:
    tender.description ||
    `Bid on ${tender.title}. View tender details, requirements, and submit your proposal through TERI Tenders platform.`,
  alternates: {
    canonical: `${BASE_URL}/tender/${tender.id}`,
  },
  openGraph: {
    title: `${tender.title} | TERI Tenders`,
    description:
      tender.description ||
      `Tender opportunity from TERI. Department: ${
        tender.department || "General"
      }`,
    url: `${BASE_URL}/tender/${tender.id}`,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: `${tender.title} | TERI Tenders`,
    description: tender.description || `Tender opportunity from TERI`,
  },
  keywords: [
    "TERI Tender",
    tender.title,
    tender.department || "",
    "Tender Bidding",
    "Procurement Opportunity",
    "Government Contract",
  ].filter(Boolean),
});
