"use client";
import React from "react";
import { useSession } from "next-auth/react";
import VendorInvitationsCard from "./HomeSidebar/VendorInvitationsCard";
import ClosingSoonCard from "./HomeSidebar/ClosingSoonCard";
import HowToBidCard from "./HomeSidebar/HowToBidCard";
import AnsweredQuestionsCard from "./HomeSidebar/AnsweredQuestionsCard";
import HelpCard from "./HomeSidebar/HelpCard";

/**
 * Home page sidebar. The cards scroll with the page, except the help card,
 * which stays in view on desktop once the cards above it have scrolled away.
 * Cards with nothing to show render nothing.
 */
const HomeRightSection = () => {
  // Checked against "unauthenticated" so signed-in users never see the
  // visitor cards flash in while the session loads
  const { data: session, status } = useSession();
  const isVisitor = status === "unauthenticated";
  const isVendor = session?.user?.role === "vendor";

  return (
    <div className='flex w-full flex-col gap-4 lg:w-64 xl:w-80'>
      {/* A vendor's own tenders lead, ahead of the portal-wide cards */}
      {isVendor && <VendorInvitationsCard />}
      <ClosingSoonCard />
      {isVisitor && <HowToBidCard />}
      <AnsweredQuestionsCard />
      <div className='lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto'>
        <HelpCard />
      </div>
    </div>
  );
};

export default HomeRightSection;
