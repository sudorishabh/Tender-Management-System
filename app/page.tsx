import GeneralWrapper from "@/_components/Shared/GeneralWrapper";
import HomeSidebar from "@/app/_components/HomeRightSection";
import HomeBanner from "@/app/_components/HomeBanner";
import HomeTendersActionBar from "@/app/_components/HomeTenderActionBar/HomeTendersActionBar";
import HomeTenders from "./_components/HomeTenders";
import type { Metadata } from "next";
import { BASE_URL } from "@/lib/seo.config";

export const metadata: Metadata = {
  alternates: { canonical: BASE_URL },
};

const Home = () => {
  return (
    // Same tinted canvas as the dashboards so white cards stand off it.
    // flow-root keeps GeneralWrapper's margins inside the tinted area.
    <div className='flow-root min-h-svh bg-canvas'>
      <GeneralWrapper>
        {/* pt clears the fixed header, which is h-12 on mobile / h-14 from md.
            px-4 pads phones only - GeneralWrapper pads from sm upwards */}
        <div className='flex flex-col lg:flex-row gap-0 lg:gap-3 xl:gap-8 px-4 pt-12 sm:px-0 md:pt-14'>
          {/* Main Content Area */}
          <main
            className='flex flex-1 flex-col min-w-0'
            role='main'>
            <section aria-label='Welcome banner'>
              <HomeBanner />
            </section>
            <HomeTendersActionBar />
            <section aria-label='Tender listings'>
              <h2 className='sr-only'>Available Tenders</h2>
              <HomeTenders />
            </section>
          </main>
          {/* Sidebar - stacks below the listings on small screens so mobile
              visitors still get the support contacts and FAQ. On desktop it
              spans the list's height so its help card can stay in view. */}
          <aside
            aria-label='Tender updates and help'
            className='mt-10 shrink-0 lg:mt-0 lg:flex'>
            <HomeSidebar />
          </aside>
        </div>
      </GeneralWrapper>
    </div>
  );
};

export default Home;
