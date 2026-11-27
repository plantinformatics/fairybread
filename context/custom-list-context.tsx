"use client"

import { createContext, useContext } from 'react';
import {
    createLocalStorageStore,
    parseStoredStringArray,
    useIsHydrated,
    useLocalStorageStore,
} from '@/lib/local-storage-store';


const CUSTOM_LIST_STORAGE_KEY = 'pca-custom-list-ids';

const customListStore = createLocalStorageStore(
    CUSTOM_LIST_STORAGE_KEY,
    parseStoredStringArray,
    JSON.stringify,
);


interface CustomListContextValue {
    customList: string[];
    setCustomList: (f: string[]) => void;
    /** False until the stored list has been read from localStorage. */
    isHydrated: boolean;
}

const CustomListContext = createContext<CustomListContextValue | undefined>(undefined);

export function CustomListProvider({ children }: { children: React.ReactNode }) {
    const customList = useLocalStorageStore(customListStore);
    const isHydrated = useIsHydrated();

    return <CustomListContext.Provider value={ {customList, setCustomList: customListStore.set, isHydrated} }>
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
