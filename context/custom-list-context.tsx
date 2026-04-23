"use client"

import { createContext, useContext, useEffect, useState } from 'react';


const PALETTE_STORAGE_KEY = 'pca-custom-list-ids';


interface CustomListContextValue {
    customList: string[];
    setCustomList: (f: string[]) => void;
}

const CostomListContext = createContext<CustomListContextValue | undefined>(undefined);

export function CustomListProvider({ children }: { children: React.ReactNode }) {

    const [customList, setCustomList] = useState<string[]>([])
    const [isHydrated, setIsHydrated] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const savedCustomList = window.localStorage.getItem(PALETTE_STORAGE_KEY);
        if (savedCustomList) {
            try {
                const parsedCustomList = JSON.parse(savedCustomList)
                console.log("hello", parsedCustomList)
                // JSON.parse returns any type so below is a type check
                if (Array.isArray(parsedCustomList) && parsedCustomList.every((v) => typeof v === "string")) {
                    setCustomList(parsedCustomList);
                }
            } catch {
                throw new Error ("Error in parsing previously stored customList")
            }
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!isHydrated) return;
        window.localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify(customList));
      }, [isHydrated, customList]);

    return <CostomListContext.Provider value={ {customList, setCustomList} }>
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
