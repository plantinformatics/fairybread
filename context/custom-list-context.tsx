"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';


const PALETTE_STORAGE_KEY = 'pca-custom-list-ids';
// Same key the data explorer's "Custom List" filter writes to the URL.
const CUSTOM_LIST_QUERY_KEY = 'customList';


interface CustomListContextValue {
    customList: string[];
    setCustomList: (f: string[]) => void;
}

const CostomListContext = createContext<CustomListContextValue | undefined>(undefined);

const parseStoredCustomList = (): string[] => {
    const savedCustomList = window.localStorage.getItem(PALETTE_STORAGE_KEY);
    if (!savedCustomList) return [];
    try {
        const parsedCustomList: unknown = JSON.parse(savedCustomList)
        if (Array.isArray(parsedCustomList) && parsedCustomList.every((v) => typeof v === "string")) {
            return parsedCustomList;
        }
        return [];
    } catch {
        throw new Error ("Error in parsing previously stored customList")
    }
}

// Holds the custom list (persisted to localStorage) and keeps it in sync with a
// `?customList=` filter in the URL. On load, a URL list that isn't already part
// of the stored list prompts the user to replace or keep their stored list.
export function CustomListProvider({ children }: { children: React.ReactNode }) {

    const [customList, setCustomList] = useState<string[]>([])
    const [isHydrated, setIsHydrated] = useState<boolean>(false);
    const [urlCustomList, setUrlCustomList] = useQueryState(CUSTOM_LIST_QUERY_KEY, parseAsArrayOf(parseAsString));
    // URL list waiting on the user's decision. Non-null opens the dialog.
    const [incomingList, setIncomingList] = useState<string[] | null>(null);

    // Runs once on mount: the URL is only reconciled against storage on load.
    useEffect(() => {
        const storedList = parseStoredCustomList();
        setCustomList(storedList);
        setIsHydrated(true);

        if (!urlCustomList || urlCustomList.length === 0) return;
        if (storedList.length === 0) {
            setCustomList(urlCustomList);
            return;
        }
        // A subset is a valid filter over the stored list, so nothing to resolve.
        const stored = new Set(storedList);
        if (urlCustomList.every((id) => stored.has(id))) return;
        setIncomingList(urlCustomList);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!isHydrated) return;
        window.localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify(customList));
      }, [isHydrated, customList]);

    const replaceWithIncoming = () => {
        if (incomingList) setCustomList(incomingList);
        setIncomingList(null);
    };

    // Point the URL filter at the stored list so the plot matches it.
    const keepStored = () => {
        setUrlCustomList(customList.length > 0 ? customList : null, { history: 'replace' });
        setIncomingList(null);
    };

    return <CostomListContext.Provider value={ {customList, setCustomList} }>
        { children }
        <AlertDialog open={incomingList !== null} onOpenChange={(open) => { if (!open) keepStored(); }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Replace custom list?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This link contains a different custom list. Replacing will override your existing list.
                        Existing list: {customList.length} genotype IDs. Incoming list: {incomingList?.length ?? 0} genotype IDs.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep existing</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={replaceWithIncoming}>Replace</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </CostomListContext.Provider>
}

export function useCustomList(): CustomListContextValue {
    const ctx = useContext(CostomListContext);
    if (ctx === undefined) {
        throw new Error('usePreferences must be used within a <CustomListProvider>');
      }
      return ctx;
}
