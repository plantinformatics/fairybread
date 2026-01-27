'use client';

import { useQueryStates, parseAsString } from 'nuqs';
import { useEffect, useState } from 'react';
import { fetchPCAPassportData } from '@/lib/fetchPCAPassportData';

export default function Page() {
  const [{ file, groupBy, palette }] = useQueryStates({
    file: parseAsString.withDefault('Wheat'),
    groupBy: parseAsString.withDefault('subRegion'),
    palette: parseAsString.withDefault('Dark')
  });

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const result = await fetchPCAPassportData(file);
      setData(result);
      setLoading(false);
    }
    loadData();
  }, [file]);

  if (loading) {
    return (
      <div className="mx-auto max-w-full p-4">
        <div className="mb-4 rounded-md bg-gray-100 p-4 dark:bg-gray-800">
          <h1 className="text-xl font-bold mb-2">Loading PCA Passport Data...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-full p-4">
      <div className="mb-4 rounded-md bg-gray-100 p-4 dark:bg-gray-800">
        <h1 className="text-xl font-bold mb-2">PCA Passport Data</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          File: {file} | GroupBy: {groupBy} | Palette: {palette}
        </p>
      </div>
      <pre className="overflow-auto rounded-md bg-gray-50 p-4 text-xs dark:bg-gray-900">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
