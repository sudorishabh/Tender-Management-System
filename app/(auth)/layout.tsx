import PublicProtected from "@/_components/PublicProtected";

// Each auth page sets its own metadata - a shared one gave /register and
// /accept-invite the sign-in page's canonical
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicProtected>
      <main className='pt-14'>{children}</main>
    </PublicProtected>
  );
}
