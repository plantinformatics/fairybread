"use client";

import { useEffect, useState } from "react";

import { fetchPCAPassportData } from "@/lib/fetchPCAPassportData";
import type { PCAPassportData } from "@/config/table-and-filter-config";

export function usePcaPassportData(file: string) {
  const [rawData, setRawData] = useState<PCAPassportData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setIsLoading(true);

      try {
        const nextData = await fetchPCAPassportData(file);
        if (!isCancelled) {
          setRawData(nextData);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [file]);

  return { rawData, isLoading };
}
