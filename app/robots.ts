import { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/seo.config";

export default function robots(): MetadataRoute.Robots {
  return {
    // One group for every crawler. /_next/ stays open: it holds the scripts
    // and styles crawlers need to render the pages.
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/vendor/", "/super/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
