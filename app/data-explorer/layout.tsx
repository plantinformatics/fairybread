import { Suspense } from 'react';


// Added suspense fallback loading state because it stops Next from complaining
// nuqs loading is so fast so this loading state is rarely ever seen
// Should do more work here we start parsing lots of data in via the URL
export default function DataExplorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-full p-4">
          <div className="mb-4 rounded-md bg-gray-100 p-4 dark:bg-gray-800">
            <h1 className="text-xl font-bold mb-2">Loading...</h1>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
