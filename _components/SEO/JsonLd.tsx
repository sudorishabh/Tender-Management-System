"use client";

import Script from "next/script";

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Component to inject JSON-LD structured data into the page
 * Supports single schema or array of schemas
 */
export const JsonLd = ({ data }: JsonLdProps) => {
  const schemas = Array.isArray(data) ? data : [data];

  return (
    <>
      {schemas.map((schema, index) => (
        <Script
          key={`json-ld-${index}`}
          id={`json-ld-${index}`}
          type='application/ld+json'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 0),
          }}
        />
      ))}
    </>
  );
};

/**
 * Server component version for structured data
 * Use this in server components like layout.tsx
 */
export const JsonLdScript = ({ data }: JsonLdProps) => {
  const schemas = Array.isArray(data) ? data : [data];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`json-ld-${index}`}
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            // Escape "<" so text such as a tender description containing
            // "</script>" cannot close the tag early
            __html: JSON.stringify(schema, null, 0).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
};

export default JsonLd;
