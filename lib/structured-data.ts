import { BASE_URL, ORGANIZATION } from "./seo.config";

// Organization Schema
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  name: ORGANIZATION.name,
  alternateName: ORGANIZATION.shortName,
  url: ORGANIZATION.url,
  logo: {
    "@type": "ImageObject",
    url: ORGANIZATION.logo,
    width: "512",
    height: "512",
  },
  description: ORGANIZATION.description,
  foundingDate: ORGANIZATION.foundingDate,
  address: {
    "@type": "PostalAddress",
    streetAddress: ORGANIZATION.address.streetAddress,
    addressLocality: ORGANIZATION.address.addressLocality,
    addressRegion: ORGANIZATION.address.addressRegion,
    postalCode: ORGANIZATION.address.postalCode,
    addressCountry: ORGANIZATION.address.addressCountry,
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: ORGANIZATION.contactPoint.telephone,
    contactType: ORGANIZATION.contactPoint.contactType,
    email: ORGANIZATION.contactPoint.email,
    availableLanguage: ["English", "Hindi"],
  },
  sameAs: ORGANIZATION.sameAs,
};

// Website Schema
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  url: BASE_URL,
  name: "TERI Tenders - Official eTender Portal",
  alternateName: [
    "TERI eTender",
    "TERI Tender Portal",
    "TERI Procurement Portal",
    "The Energy and Resources Institute Tenders",
    "TERI Bidding Portal",
  ],
  description:
    "Official TERI eTender Portal - India's trusted tender management platform for government and private sector procurement by The Energy and Resources Institute",
  publisher: {
    "@id": `${BASE_URL}/#organization`,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      // The home page reads its search box from ?q=
      urlTemplate: `${BASE_URL}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
  inLanguage: "en-IN",
  about: [
    {
      "@type": "Thing",
      name: "TERI",
      sameAs: "https://www.teriin.org/",
    },
    {
      "@type": "Thing",
      name: "Tender",
      description:
        "A formal offer to supply goods or services at a stated price",
    },
    {
      "@type": "Thing",
      name: "E-Procurement",
      description: "Electronic procurement and tendering system",
    },
  ],
};

// Service Schema for Tender Management
export const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${BASE_URL}/#service`,
  name: "TERI eTender Management System",
  alternateName: [
    "TERI Tender Portal",
    "TERI Procurement System",
    "TERI Bidding Platform",
  ],
  serviceType: "Tender and Procurement Management",
  provider: {
    "@id": `${BASE_URL}/#organization`,
  },
  description:
    "Official TERI eTender portal - Comprehensive electronic tender management system by The Energy and Resources Institute. Submit bids for government tenders, research projects, sustainable development initiatives, and environmental programs.",
  areaServed: {
    "@type": "Country",
    name: "India",
  },
  audience: {
    "@type": "Audience",
    audienceType:
      "Vendors, Contractors, Suppliers, Research Organizations, NGOs",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "TERI Tender Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Tender Publication",
          description: "Publish and manage tender notices online",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Bid Submission",
          description: "Submit bids electronically with document management",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Vendor Registration",
          description: "Register as a vendor to participate in tenders",
        },
      },
    ],
  },
};

// Webpage Schema Generator
export const generateWebPageSchema = (
  title: string,
  description: string,
  url: string,
  breadcrumbs?: Array<{ name: string; url: string }>
) => {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}/#webpage`,
    url: url,
    name: title,
    description: description,
    isPartOf: {
      "@id": `${BASE_URL}/#website`,
    },
    about: {
      "@id": `${BASE_URL}/#organization`,
    },
    inLanguage: "en-IN",
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
  };

  if (breadcrumbs && breadcrumbs.length > 0) {
    schema.breadcrumb = {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }

  return schema;
};

/**
 * Tender DATETIME columns hold Indian wall-clock time, which the driver reads
 * as if it were UTC (see utils/dateUtils.ts). Re-attach the real +05:30 offset
 * so search engines get the correct instant.
 */
const toIstIsoString = (value?: Date | string | null) => {
  if (!value) return undefined;
  const wallClock =
    typeof value === "string"
      ? value.replace(" ", "T").slice(0, 19)
      : value.toISOString().slice(0, 19);
  return `${wallClock}+05:30`;
};

// Tender Schema Generator - a tender is TERI seeking goods or services, which
// schema.org models as a Demand (a Product would claim something is on sale)
export const generateTenderSchema = (tender: {
  id: number;
  title: string;
  description?: string;
  department?: string;
  location?: string;
  referenceNumber?: string;
  releaseDate?: Date | string | null;
  bidDeadline?: Date | string | null;
}) => {
  const url = `${BASE_URL}/tender/${tender.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "Demand",
    "@id": `${url}#tender`,
    name: tender.title,
    description: tender.description || `Tender opportunity: ${tender.title}`,
    url,
    identifier: tender.referenceNumber,
    category: tender.department,
    areaServed: tender.location,
    availabilityStarts: toIstIsoString(tender.releaseDate),
    availabilityEnds: toIstIsoString(tender.bidDeadline),
  };
};

// Event Schema for Active Tenders
export const generateTenderEventSchema = (tender: {
  id: number;
  title: string;
  description?: string;
  bidStartDate?: Date;
  bidEndDate?: Date;
  location?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  name: `Tender: ${tender.title}`,
  description: tender.description || `Tender bidding event for ${tender.title}`,
  startDate: tender.bidStartDate?.toISOString(),
  endDate: tender.bidEndDate?.toISOString(),
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  location: {
    "@type": "VirtualLocation",
    url: `${BASE_URL}/tender/${tender.id}`,
  },
  organizer: {
    "@id": `${BASE_URL}/#organization`,
  },
  offers: {
    "@type": "Offer",
    url: `${BASE_URL}/tender/${tender.id}`,
    availability: "https://schema.org/InStock",
  },
});

// Breadcrumb Schema Generator
export const generateBreadcrumbSchema = (
  items: Array<{ name: string; url: string }>
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

// Site-wide schemas, rendered on every page by the root layout. The FAQPage
// markup lives on /faq only - it has to match questions visible on the page.
export const siteSchemas = [organizationSchema, websiteSchema, serviceSchema];
