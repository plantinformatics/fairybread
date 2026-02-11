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
        null
      }
    >
      {children}
    </Suspense>
  );
}
