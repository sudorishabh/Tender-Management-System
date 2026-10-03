import GeneralWrapper from "@/_components/Shared/GeneralWrapper";
import HomeSidebar from "@/app/_components/HomeRightSection";
import HomeBanner from "@/app/_components/HomeBanner";
import HomeTendersActionBar from "@/app/_components/HomeTenderActionBar/HomeTendersActionBar";
import HomeTenders from "./_components/HomeTenders";

const Home = () => {
  return (
    <GeneralWrapper>
      {/* pt clears the fixed header, which is h-12 on mobile / h-14 from md */}
      <div className='flex flex-col lg:flex-row gap-0 lg:gap-3 xl:gap-8 pt-12 md:pt-14'>
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
            stays in view while the list scrolls. */}
        <aside
          aria-label='Help and support'
          className='mt-10 shrink-0 lg:sticky lg:top-20 lg:mt-0 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto'>
          <HomeSidebar />
        </aside>
      </div>
    </GeneralWrapper>
  );
};

export default Home;
