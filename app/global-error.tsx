"use client";

export default function GlobalError({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className='flex min-h-screen flex-col items-center justify-center gap-4'>
          <h2 className='text-2xl font-semibold text-gray-900'>
            Something went wrong!
          </h2>
          <button
            onClick={() => reset()}
            className='px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover'>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
