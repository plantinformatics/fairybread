import { fetchPCAPassportData } from '@/lib/fetchPCAPassportData';
import ClientPageContent from '@/components/ClientPageContent';

type SearchParams = {
  file?: string;
  groupBy?: string;
  palette?: string;
};

// Server Component - runs on server, data fetching happens here
export default async function Page({ 
  searchParams 
}: { 
  searchParams: Promise<SearchParams>
}) {
  // In Next.js 15+, searchParams is a Promise and must be awaited
  const params = await searchParams;
  
  const PCAFile = params.file || 'Wheat';
  const groupingValue = params.groupBy || 'subRegion';
  const paletteKey = params.palette || 'Dark';
  
  // This runs on the server - data is fetched before rendering
  const data = await fetchPCAPassportData(PCAFile);
  
  return (
    <div className="mx-auto max-w-full p-4">
      <div className="mb-4 rounded-md bg-gray-100 p-4 dark:bg-gray-800">
        <h1 className="text-xl font-bold mb-2">PCA Passport Data</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          File: {PCAFile} | GroupBy: {groupingValue} | Palette: {paletteKey}
        </p>
      </div>
      <pre className="overflow-auto rounded-md bg-gray-50 p-4 text-xs dark:bg-gray-900">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
