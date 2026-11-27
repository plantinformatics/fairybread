import { useSyncExternalStore } from 'react';

/**
 * A single localStorage key exposed as an external store for
 * `useSyncExternalStore`. Reads parse the raw string on demand and cache the
 * result per raw value so snapshots stay referentially stable. Writes go
 * straight to localStorage and notify subscribers in this tab; other tabs are
 * picked up through the window `storage` event.
 *
 * The server snapshot is a fixed default (`parse(null)` unless given), so the
 * first client render matches the server HTML and React re-renders with the
 * stored value straight after hydration.
 */
export interface LocalStorageStore<T> {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (value: T) => void;
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function createLocalStorageStore<T>(
  key: string,
  parse: (raw: string | null) => T,
  serialize: (value: T) => string,
  /** Value for SSR and hydration. Defaults to `parse(null)`. */
  serverValue: T = parse(null),
): LocalStorageStore<T> {
  const listeners = new Set<() => void>();
  let cache: { raw: string | null; value: T } | undefined;

  const notify = () => listeners.forEach((listener) => listener());

  const onStorage = (event: StorageEvent) => {
    // `key` is null when another tab calls `localStorage.clear()`.
    if (event.key === key || event.key === null) notify();
  };

  return {
    subscribe(onChange) {
      if (listeners.size === 0) window.addEventListener('storage', onStorage);
      listeners.add(onChange);
      return () => {
        listeners.delete(onChange);
        if (listeners.size === 0) window.removeEventListener('storage', onStorage);
      };
    },
    getSnapshot() {
      const raw = readRaw(key);
      if (cache === undefined || cache.raw !== raw) cache = { raw, value: parse(raw) };
      return cache.value;
    },
    getServerSnapshot: () => serverValue,
    set(value) {
      try {
        window.localStorage.setItem(key, serialize(value));
      } catch {
        // Storage full or blocked: subscribers re-read and keep the old value.
      }
      notify();
    },
  };
}

/** Subscribe a component to a store and return its current value. */
export function useLocalStorageStore<T>(store: LocalStorageStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

const subscribeNever = () => () => {};

/** False during SSR and hydration, true on every client render after that. */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}

// ---------------------------------------------------------------------------
// Parsers for stored values. Each returns the default for missing or invalid
// input, so a corrupted entry never throws.
// ---------------------------------------------------------------------------

/** Parse a stored `"true"`/`"false"` flag, or `fallback` if missing/invalid. */
export function parseStoredBoolean(raw: string | null, fallback: boolean): boolean {
  return raw === 'true' || raw === 'false' ? raw === 'true' : fallback;
}

/** Parse a stored JSON `string[]`, or `[]` if missing, malformed or the wrong shape. */
export function parseStoredStringArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) && parsed.every((v) => typeof v === 'string') ? parsed : [];
  } catch {
    return [];
  }
}

export const PC_OPTIONS = [
  'PC1', 'PC2', 'PC3', 'PC4', 'PC5',
  'PC6', 'PC7', 'PC8', 'PC9', 'PC10',
] as const;
export type PcAxis = typeof PC_OPTIONS[number];

export interface PcAxes {
  x: PcAxis;
  y: PcAxis;
  z: PcAxis | null; // optional value for 3d plotly
}

export const DEFAULT_PC_AXES: PcAxes = { x: 'PC1', y: 'PC2', z: null };

const isPcAxis = (value: unknown): value is PcAxis =>
  typeof value === 'string' && (PC_OPTIONS as readonly string[]).includes(value);

/** Parse a stored JSON blob into `PcAxes`, falling back to defaults per field. */
export function parseStoredPcAxes(raw: string | null): PcAxes {
  if (!raw) return DEFAULT_PC_AXES;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_PC_AXES;
    const { x, y, z } = parsed as Record<string, unknown>;
    return {
      x: isPcAxis(x) ? x : DEFAULT_PC_AXES.x,
      y: isPcAxis(y) ? y : DEFAULT_PC_AXES.y,
      z: isPcAxis(z) ? z : null,
    };
  } catch {
    return DEFAULT_PC_AXES;
  }
}
