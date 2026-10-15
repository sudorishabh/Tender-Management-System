/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";
import path from "path";

// Dev tooling (React Refresh, eval source maps) needs eval; production builds
// don't, and allowing it there only helps injected script
const scriptSrc =
  process.env.NODE_ENV === "production"
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const nextConfig: NextConfig = {
  serverExternalPackages: ["canvas", "pdfjs-dist"],
  // output: "standalone", // Commented out to avoid EPERM symlink issues on Windows

  poweredByHeader: false,
  compress: true,
  turbopack: {},

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days cache
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              scriptSrc,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https:",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
      {
        source: "/(.*).(ico|png|jpg|jpeg|svg|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  webpack: (config: WebpackConfig, { isServer }: { isServer: boolean }) => {
    // Handle canvas module for pdfjs-dist (used by @react-pdf-viewer)
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...(config.resolve?.fallback || {}),
        canvas: false,
      },
      // Alias '@/components/*' to the new '_components' folder so legacy imports still resolve
      alias: {
        ...(config.resolve?.alias || {}),
        "@/components": path.resolve(__dirname, "_components"),
      },
    };

    // Mark canvas as external to prevent webpack from trying to bundle it
    if (!isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push({ canvas: "canvas" });
      }
    }

    // Add rule for binary modules
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
      type: "javascript/auto",
    });

    return config;
  },
};

export default nextConfig;
