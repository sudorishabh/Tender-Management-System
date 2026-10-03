import React, { FC } from "react";
import { BASE_URL } from "@/lib/seo.config";

interface HeadProps {
  title: string;
  description: string;
  keywords: string;
  canonicalPath?: string;
  ogImage?: string;
  noIndex?: boolean;
}

/**
 * SEO-optimized Head component for dynamic pages
 * Provides comprehensive meta tags for search engines and social sharing
 */
const Heading: FC<HeadProps> = ({
  title,
  description,
  keywords,
  canonicalPath,
  ogImage = `${BASE_URL}/opengraph-image`,
  noIndex = false,
}) => {
  const canonicalUrl = canonicalPath
    ? `${BASE_URL}${canonicalPath}`
    : undefined;
  const fullTitle = title.includes("TERI") ? title : `${title} | TERI Tenders`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1'
      />
      <meta
        name='description'
        content={description}
      />
      <meta
        name='keywords'
        content={keywords}
      />

      {/* Canonical URL */}
      {canonicalUrl && (
        <link
          rel='canonical'
          href={canonicalUrl}
        />
      )}

      {/* Open Graph Meta Tags */}
      <meta
        property='og:title'
        content={fullTitle}
      />
      <meta
        property='og:description'
        content={description}
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
      {canonicalUrl && (
        <meta
          property='og:url'
          content={canonicalUrl}
        />
      )}
      <meta
        property='og:image'
        content={ogImage}
      />
      <meta
        property='og:image:width'
        content='1200'
      />
      <meta
        property='og:image:height'
        content='630'
      />
      <meta
        property='og:image:alt'
        content={fullTitle}
      />

      {/* Twitter Card Meta Tags */}
      <meta
        name='twitter:card'
        content='summary_large_image'
      />
      <meta
        name='twitter:site'
        content='@teraboratory'
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

      {/* Additional SEO meta tags */}
      <meta
        name='author'
        content='TERI - The Energy and Resources Institute'
      />

      {/* Robots directive for noIndex pages */}
      {noIndex && (
        <meta
          name='robots'
          content='noindex, nofollow'
        />
      )}
    </>
  );
};

export default Heading;
