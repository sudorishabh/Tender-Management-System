import { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/seo.config";
import { sitemapTenders } from "@/server/trpc/routers/tender/tender.service";

// Rebuilt hourly so newly released tenders show up without a deploy
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages with SEO priority. Only the home page changes often enough
  // for a lastModified - stamping "now" on every page teaches search engines
  // to ignore the field.
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/register`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/sign-in`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  try {
    const tenders = await sitemapTenders();
    const tenderPages: MetadataRoute.Sitemap = tenders.map((tender) => ({
      url: `${BASE_URL}/tender/${tender.tender_id}`,
      lastModified: tender.updated_at,
      changeFrequency: "weekly",
      priority: 0.9,
    }));
    return [...staticPages, ...tenderPages];
  } catch (error) {
    // A database outage (or a build without one) should not take the
    // sitemap down - serve the static pages until the next rebuild
    console.error("Failed to load tenders for the sitemap", error);
    return staticPages;
  }
}
