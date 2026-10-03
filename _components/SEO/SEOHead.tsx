import { BASE_URL } from "@/lib/seo.config";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
  keywords?: string[];
}

/**
 * Enhanced SEO Head component for page-level SEO
 * Use this for dynamic pages where you need runtime SEO control
 */
export const SEOHead = ({
  title = "TERI Tenders - eTender Management System",
  description = "Discover, bid, and manage tenders efficiently with TERI's comprehensive eTender management platform.",
  canonicalUrl,
  ogImage = `${BASE_URL}/opengraph-image`,
  noIndex = false,
  keywords = [],
}: SEOHeadProps) => {
  const fullTitle = title.includes("TERI") ? title : `${title} | TERI Tenders`;
  const canonical = canonicalUrl || BASE_URL;

  return (
    <>
      <title>{fullTitle}</title>
      <meta
        name='description'
        content={description}
      />
      {keywords.length > 0 && (
        <meta
          name='keywords'
          content={keywords.join(", ")}
        />
      )}
      <link
        rel='canonical'
        href={canonical}
      />

      {/* Open Graph */}
      <meta
        property='og:title'
        content={fullTitle}
      />
      <meta
        property='og:description'
        content={description}
      />
      <meta
        property='og:url'
        content={canonical}
      />
      <meta
        property='og:image'
        content={ogImage}
      />
      <meta
        property='og:type'
        content='website'
      />
      <meta
        property='og:site_name'
        content='TERI Tenders'
      />
      <meta
        property='og:locale'
        content='en_IN'
      />

      {/* Twitter */}
      <meta
        name='twitter:card'
        content='summary_large_image'
      />
      <meta
        name='twitter:title'
        content={fullTitle}
      />
      <meta
        name='twitter:description'
        content={description}
      />
      <meta
        name='twitter:image'
        content={ogImage}
      />
      <meta
        name='twitter:site'
        content='@teriin'
      />

      {/* Robots */}
      {noIndex && (
        <meta
          name='robots'
          content='noindex, nofollow'
        />
      )}

      {/* Additional SEO meta tags */}
      <meta
        name='author'
        content='TERI - The Energy and Resources Institute'
      />
      <meta
        name='geo.region'
        content='IN-DL'
      />
      <meta
        name='geo.placename'
        content='New Delhi'
      />
      <meta
        name='geo.position'
        content='28.5893;77.2270'
      />
      <meta
        name='ICBM'
        content='28.5893, 77.2270'
      />
    </>
  );
};

export default SEOHead;
