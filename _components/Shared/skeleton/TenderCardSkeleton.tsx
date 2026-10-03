import { Skeleton } from "@/_components/ui/skeleton";

/**
 * Mirrors the anatomy of TenderCard (badge row, title, meta chips, footer
 * strip) at the same widths and radii, so the swap to real content does not
 * shift the layout.
 */
const TenderCardSkeletonItem = () => (
  <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
    <div className='p-4 pb-3'>
      {/* Badge row + deadline pill */}
      <div className='mb-3 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-4 w-14 rounded-full bg-gray-200/70' />
          <Skeleton className='h-4 w-24 rounded-md bg-gray-200/70' />
        </div>
        <Skeleton className='h-4 w-20 rounded-full bg-gray-200/70' />
      </div>

      {/* Title */}
      <Skeleton className='mb-2 h-4 w-3/4 bg-gray-200/70' />
      {/* Description */}
      <Skeleton className='mb-1.5 h-3 w-full bg-gray-200/70' />
      <Skeleton className='h-3 w-2/3 bg-gray-200/70' />

      {/* Meta chips */}
      <div className='mt-3 flex flex-wrap items-center gap-3'>
        <Skeleton className='h-3 w-28 bg-gray-200/70' />
        <Skeleton className='h-3 w-20 bg-gray-200/70' />
        <Skeleton className='h-3 w-24 bg-gray-200/70' />
      </div>
    </div>

    {/* Footer strip */}
    <div className='flex items-center justify-between gap-4 border-t border-dashed border-slate-200 bg-slate-50/60 px-4 py-3'>
      <div className='flex flex-wrap items-center gap-4'>
        <Skeleton className='h-3 w-24 bg-gray-200/70' />
        <Skeleton className='h-3 w-20 bg-gray-200/70' />
        <Skeleton className='h-3 w-32 bg-gray-200/70' />
      </div>
      <Skeleton className='hidden h-3 w-20 bg-gray-200/70 sm:block' />
    </div>
  </div>
);

const TenderCardSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <div
      className='flex flex-col gap-6 pb-10'
      role='status'
      aria-busy='true'
      aria-label='Loading tenders'>
      <span className='sr-only'>Loading tenders...</span>
      {Array.from({ length: count }).map((_, i) => (
        <TenderCardSkeletonItem key={i} />
      ))}
    </div>
  );
};

export default TenderCardSkeleton;
