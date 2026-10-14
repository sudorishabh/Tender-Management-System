# SEO Implementation Guide - TERI Tenders

This document outlines the SEO implementation for the TERI Tenders eTender Management System.

## Overview

The SEO implementation includes:

- ✅ Comprehensive metadata configuration
- ✅ Open Graph and Twitter Cards
- ✅ Dynamic sitemap generation
- ✅ Robots.txt configuration
- ✅ JSON-LD structured data (Schema.org)
- ✅ Dynamic OG image generation
- ✅ Performance optimizations

## File Structure

```
lib/
├── seo.config.ts          # Central SEO configuration
├── structured-data.ts     # JSON-LD schema generators

_components/
└── SEO/
    ├── index.ts           # SEO components exports
    ├── JsonLd.tsx         # JSON-LD injection component
    └── SEOHead.tsx        # Dynamic head component

app/
├── page.tsx               # Home: h1 and first page of tenders rendered on the server
├── _lib/getHomeTenders.ts # Loads that first page (skipped when the URL has filters)
├── sitemap.ts             # Static pages + every public tender, rebuilt hourly
├── robots.ts              # Robots.txt configuration
├── opengraph-image.tsx    # 1200x630 share image used as og:image site-wide
└── tender/[tenderId]/
    └── page.tsx           # Server-rendered: generateMetadata + tender JSON-LD

public/
├── manifest.json          # PWA manifest
├── favicon.ico            # 16/32/48px square crops of TERI_LOGO.png
├── icon-192.png           # Favicon Google shows in search results (square, 4 x 48px)
├── icon-512.png           # Manifest icon
└── apple-touch-icon.png   # 180px home-screen icon
```

The home page reads the session on the server only to decide whether the
visitor banner (which holds the page's h1) belongs in the HTML. Signed-in
users still see nothing there until their session loads, as before.

### Search Console

Set `GOOGLE_SITE_VERIFICATION` to the token from Search Console's "HTML tag"
method to add the verification meta tag, then submit
`https://etender.teri.res.in/sitemap.xml`.

## Configuration

### Base URL

Update the `BASE_URL` in `lib/seo.config.ts`:

```typescript
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://etender.teri.res.in";
```

Add to `.env`:

```env
NEXT_PUBLIC_BASE_URL=https://etender.teri.res.in
```

### Organization Details

Update organization information in `lib/seo.config.ts`:

```typescript
export const ORGANIZATION = {
  name: "TERI - The Energy and Resources Institute",
  // ... other details
};
```

## Usage

### Page-Level Metadata

For static pages, use Next.js metadata export:

```typescript
import { generatePageMetadata } from "@/lib/seo.config";

export const metadata: Metadata = generatePageMetadata(
  "Page Title",
  "Page description for SEO",
  "/page-path",
  ["keyword1", "keyword2"]
);
```

### Dynamic Pages

For client components, use the enhanced `Heading` component:

```typescript
import Heading from "@/_components/Shared/Heading";

<Heading
  title='Dynamic Page Title'
  description='Page description'
  keywords='keyword1, keyword2'
  canonicalPath='/page-path'
/>;
```

### Structured Data

Add JSON-LD to pages:

```typescript
import { JsonLd } from "@/_components/SEO/JsonLd";
import { organizationSchema } from "@/lib/structured-data";

<JsonLd data={organizationSchema} />;
```

### Dynamic OG Images

Generate OG images for tenders:

```
/api/og?title=Tender+Title&description=Tender+Description&type=tender
```

## Structured Data Schemas

The following Schema.org types are implemented:

1. **Organization** - TERI organization details (every page)
2. **WebSite** - Site-wide schema with search action on `/?q=` (every page)
3. **Service** - eTender management service (every page)
4. **Demand** - Individual tender pages (a tender is TERI seeking goods or services)
5. **FAQPage** - `/faq` only, built from `lib/faqs.ts`
6. **BreadcrumbList** - Tender pages and `/faq`

## SEO Checklist

### Before Launch

- [ ] Update BASE_URL to production domain
- [ ] Verify all meta descriptions are unique
- [ ] Check Open Graph images display correctly
- [ ] Submit sitemap to Google Search Console
- [ ] Verify robots.txt allows proper crawling

### Ongoing

- [ ] Monitor Core Web Vitals in Search Console
- [ ] Track keyword rankings
- [ ] Update structured data as needed
- [ ] Add new pages to sitemap

## Performance Optimizations

Added in `next.config.ts`:

- Gzip compression enabled
- Image optimization with WebP/AVIF
- Cache headers for static assets
- DNS prefetch for external resources
- Font display swap for faster rendering

## Testing

### Validate Structured Data

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

### Check Meta Tags

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### Performance

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Lighthouse](Chrome DevTools > Lighthouse)

## Common Tasks

### Add a New Page with SEO

1. Create page in `app/` directory
2. Export metadata using `generatePageMetadata()`
3. Add structured data if relevant
4. Update sitemap if needed

### Update Tender Schema

Edit `lib/structured-data.ts` → `generateTenderSchema()`

### Add New FAQ

Edit `lib/faqs.ts` - the FAQ page and its FAQPage markup both read from it
