import { Suspense } from 'react';


// Next requires a Suspense boundary around nuqs' search-param reads; the fallback is rarely seen.
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
