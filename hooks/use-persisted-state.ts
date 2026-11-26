'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { createKeyValueStore, createPersistedValue, type Codec } from '@/lib/persisted-store';

const localStore = createKeyValueStore(() =>
  typeof window === 'undefined' ? undefined : window.localStorage,
);

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => localStore.notify(event.key));
}

/**
 * `useState` backed by a localStorage key, kept in sync across hook instances
 * and tabs. The server render and hydration use `defaultValue`; React then
 * re-renders with the stored value. Pass a module-level `codec` and
 * `defaultValue` so the subscription isn't recreated on every render.
 */
export function usePersistedState<T, D = T>(key: string, defaultValue: D, codec: Codec<T>) {
  const persisted = useMemo(
    () => createPersistedValue(localStore, key, defaultValue, codec),
    [key, defaultValue, codec],
  );
  const value = useSyncExternalStore(persisted.subscribe, persisted.get, () => defaultValue);
  return [value, persisted.set, persisted.remove] as const;
}

const subscribeToNothing = () => () => {};

/** False during the server render and hydration, true once the client can read browser-only state. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribeToNothing, () => true, () => false);
}
