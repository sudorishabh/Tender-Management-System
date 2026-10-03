import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo.config";

// The page itself is a client component, so its metadata lives here
export const metadata: Metadata = generatePageMetadata(
  "Sign In",
  "Sign in to TERI Tenders to access your vendor dashboard, submit bids, and manage your tender applications.",
  "/sign-in",
  ["TERI Tenders Login", "Vendor Sign In", "Tender Portal Access"]
);

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
