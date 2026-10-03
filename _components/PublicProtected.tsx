"use client";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PageLoading from "./Shared/PageLoading";
import { getPostSignInPath } from "@/lib/auth/callback-url";

interface Props {
  children: React.ReactNode;
}

const PublicProtected: FC<Props> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (status !== "loading") {
      if (status === "authenticated") {
        // Signing in flips the session to authenticated, so this must head
        // for the same page the sign-in form does or it would override it
        router.replace(getPostSignInPath());
        return;
      }

      setIsAuthorized(true);
    }
  }, [status, router]);

  if (status === "loading" || isAuthorized === null) {
    return <PageLoading />;
  }

  if (isAuthorized === false) {
    return null;
  }

  return <>{children}</>;
};

export default PublicProtected;
