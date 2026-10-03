"use client";
import React from "react";
import HelpCard from "./HomeSidebar/HelpCard";

/**
 * Home page sidebar. The cards scroll with the page, except the help card,
 * which stays in view on desktop once the cards above it have scrolled away.
 */
const HomeRightSection = () => (
  <div className='flex w-full flex-col gap-4 lg:w-64 xl:w-80'>
    <div className='lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto'>
      <HelpCard />
    </div>
  </div>
);

export default HomeRightSection;
