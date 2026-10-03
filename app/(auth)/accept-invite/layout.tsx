import { Metadata } from "next";

// Invite links carry a one-off token and are meant for a single admin, so
// they should never show up in search results
export const metadata: Metadata = {
  title: "Accept Invitation",
  robots: { index: false, follow: false },
};

export default function AcceptInviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
