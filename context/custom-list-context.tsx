"use client"

import { createContext, useContext } from 'react';
import { useHydrated, usePersistedState } from '@/hooks/use-persisted-state';
import { jsonCodec } from '@/lib/storage-codecs';
import { isStringArray } from '@/lib/type-guards';

const CUSTOM_LIST_STORAGE_KEY = 'pca-custom-list-ids';
const EMPTY_LIST: string[] = [];
const customListCodec = jsonCodec((json) => (isStringArray(json) ? json : undefined));

interface CustomListContextValue {
    customList: string[];
    setCustomList: (f: string[]) => void;
    /** False until the stored list has been read, so "not read yet" isn't mistaken for an empty list. */
    isHydrated: boolean;
}

const CustomListContext = createContext<CustomListContextValue | undefined>(undefined);

export function CustomListProvider({ children }: { children: React.ReactNode }) {
    const [customList, setCustomList] = usePersistedState(CUSTOM_LIST_STORAGE_KEY, EMPTY_LIST, customListCodec);
    const isHydrated = useHydrated();

    return <CustomListContext.Provider value={ {customList, setCustomList, isHydrated} }>
        { children }
    </CustomListContext.Provider>
}

export function useCustomList(): CustomListContextValue {
    const ctx = useContext(CustomListContext);
    if (ctx === undefined) {
        throw new Error('useCustomList must be used within a <CustomListProvider>');
      }
      return ctx;
}
