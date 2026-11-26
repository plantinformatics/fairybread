"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { isStringArray } from '@/lib/type-guards';


const PALETTE_STORAGE_KEY = 'pca-custom-list-ids';


interface CustomListContextValue {
    customList: string[];
    setCustomList: (f: string[]) => void;
    /** False until the stored list has been read from localStorage. */
    isHydrated: boolean;
}

const CostomListContext = createContext<CustomListContextValue | undefined>(undefined);

export function CustomListProvider({ children }: { children: React.ReactNode }) {

    const [customList, setCustomList] = useState<string[]>([])
    const [isHydrated, setIsHydrated] = useState<boolean>(false);

    useEffect(() => {
        const savedCustomList = window.localStorage.getItem(PALETTE_STORAGE_KEY);
        if (savedCustomList) {
            try {
                const parsedCustomList: unknown = JSON.parse(savedCustomList)
                if (isStringArray(parsedCustomList)) {
                    setCustomList(parsedCustomList);
                }
            } catch {
                throw new Error ("Error in parsing previously stored customList")
            }
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated) return;
        window.localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify(customList));
      }, [isHydrated, customList]);

    return <CostomListContext.Provider value={ {customList, setCustomList, isHydrated} }>
        { children }
    </CostomListContext.Provider>
}

export function useCustomList(): CustomListContextValue {
    const ctx = useContext(CostomListContext);
    if (ctx === undefined) {
        throw new Error('usePreferences must be used within a <CustomListProvider>');
      }
      return ctx;
}
