'use client';

import { useState } from 'react';
import type { PCAPassportData } from '@/config/table-and-filter-config';
import { usePcaData } from '@/context/pca-data-context';
import { ArrowRight } from 'lucide-react';
import { parseInput, matchTerms } from '@/lib/customListParseMatch'
import { useCustomList } from '@/context/custom-list-context';
import { usePersistedState } from '@/hooks/use-persisted-state';
import { stringCodec } from '@/lib/storage-codecs';
import { CropSection } from '@/components/custom-list/crop-section';
import { GenotypeInputSection } from '@/components/custom-list/genotype-input-section';
import { ResultsSection } from '@/components/custom-list/results-section';
import { CustomListAside } from '@/components/custom-list/custom-list-aside';
import posthog from 'posthog-js';

const CUSTOM_LIST_TEXT_STORAGE_KEY = 'pca-custom-list-text';

export default function CustomListPage() {
  const { file, rawData, isLoading } = usePcaData();
  const { customList, setCustomList} = useCustomList();

  const [inputText, setInputText] = usePersistedState(CUSTOM_LIST_TEXT_STORAGE_KEY, '', stringCodec);
  const [matchedRows, setMatchedRows] = useState<PCAPassportData[]>([]);
  const [unmatchedTerms, setUnmatchedTerms] = useState<string[]>([]);
  const [hasParsed, setHasParsed] = useState(false);

  const handleParse = () => {
    const terms = parseInput(inputText);
    const {matched, unmatched} = matchTerms(terms, rawData);
    const genotypeIDList = matched.map(p => p.genotypeID);
    posthog.capture('custom_list_parsed', {
      crop: file,
      terms_entered: terms.length,
      matched_count: matched.length,
      unmatched_count: unmatched.length,
    });
    setCustomList(genotypeIDList)
    setMatchedRows(matched)
    setUnmatchedTerms(unmatched)
    setHasParsed(true)
  };

  const handleReset = () => {
    posthog.capture('custom_list_cleared', { crop: file, list_size: customList.length });
    setInputText("")
    setMatchedRows([])
    setUnmatchedTerms([])
    setHasParsed(false)
  };

  return (
    <div className="mr-auto w-full max-w-7xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Custom Genotype List</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Paste a list of genotype IDs to find their records within the selected
        crop dataset. Accepts plain line-separated lists, CSV, or TSV (all
        fields are used, no header expected).
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_20rem]">
        <div className="space-y-4">
          <CropSection />
          <GenotypeInputSection
            file={file}
            isLoading={isLoading}
            inputText={inputText}
            onInputTextChange={setInputText}
            hasParsed={hasParsed}
            onParse={handleParse}
            onReset={handleReset}
          />
          {hasParsed && (
            <ResultsSection file={file} matchedRows={matchedRows} unmatchedTerms={unmatchedTerms} />
          )}
        </div>
        <FlowArrow />
        <CustomListAside />
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div aria-hidden className="hidden items-center justify-center lg:flex">
      <div className="flex size-20 items-center justify-center rounded-full border bg-background text-muted-foreground">
        <ArrowRight className="size-6" />
      </div>
    </div>
  );
}
