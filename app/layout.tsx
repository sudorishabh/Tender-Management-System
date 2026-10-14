import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import RootProvider from "../_components/RootProvider";
import Header from "../_components/Header/Header";
import { Toaster } from "@/_components/ui/sonner";
// AuthProvider and TRPCProvider are wrapped in RootProvider
// import AuthProvider from "@/_components/AuthProvider";
// import { TRPCProvider } from "@/lib/trpc";
import { defaultMetadata, defaultViewport } from "@/lib/seo.config";
import { JsonLdScript } from "@/_components/SEO/JsonLd";
import { siteSchemas } from "@/lib/structured-data";

const robotoMono = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap", // Improve font loading performance for better Core Web Vitals
});

// Export comprehensive metadata for SEO
export const metadata: Metadata = defaultMetadata;

// Export viewport configuration
export const viewport: Viewport = defaultViewport;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // en-IN matches og:locale and the structured data's inLanguage
    <html
      lang='en-IN'
      dir='ltr'>
      <head>
        {/* Structured Data for SEO. No font preconnects: next/font serves
            DM Sans from this site. */}
        <JsonLdScript data={siteSchemas} />
      </head>
      <body
        suppressHydrationWarning
        className={`${robotoMono.className} antialiased bg-white min-h-svh`}>
        {/* Skip link for keyboard accessibility */}
        {/* <a
          href='#main-content'
          className='skip-link sr-only-focusable'>
          Skip to main content
        </a> */}
        {/* <TRPCProvider> */}
        <RootProvider>
          {/* <AuthProvider> */}
          <Header />
          <div id='main-content'>{children}</div>
          <Toaster
            richColors
            theme='light'
            className='custom-toaster'
            position='bottom-right'
            closeButton={true}
          />
          {/* </AuthProvider> */}
        </RootProvider>
        {/* </TRPCProvider> */}
      </body>
    </html>
  );
}
