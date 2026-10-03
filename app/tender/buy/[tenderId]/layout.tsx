import type { Metadata } from "next";

// The purchase step needs a signed-in vendor, so it has nothing to index
export const metadata: Metadata = {
  title: "Purchase Tender Documents",
  robots: { index: false, follow: false },
};

export default function BuyTenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
