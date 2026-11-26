export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export interface Codec<T> {
  /** Returns `undefined` (or throws) for a stored value that isn't valid, so the default is used. */
  parse: (raw: string) => T | undefined;
  serialize: (value: T) => string;
}

export interface KeyValueStore {
  read: (key: string) => string | null;
  /** `null` removes the key. */
  write: (key: string, raw: string | null) => void;
  subscribe: (key: string, listener: () => void) => () => void;
  /** Tell this page's subscribers that `key` changed elsewhere (e.g. another tab); `null` means every key. */
  notify: (key: string | null) => void;
}

/**
 * Raw string storage with per-key change listeners. Never throws: storage can
 * be missing (server) or throw (private mode, quota), and writes that fail are
 * kept in memory so the page still reflects them.
 */
export function createKeyValueStore(getStorage: () => StorageLike | undefined): KeyValueStore {
  const listeners = new Map<string, Set<() => void>>();
  const unsaved = new Map<string, string | null>();

  const notify = (key: string | null) => {
    const keys = key === null ? [...listeners.keys()] : [key];
    for (const k of keys) listeners.get(k)?.forEach((listener) => listener());
  };

  return {
    read(key) {
      if (unsaved.has(key)) return unsaved.get(key) ?? null;
      try {
        return getStorage()?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    write(key, raw) {
      try {
        const storage = getStorage();
        if (!storage) throw new Error('No storage');
        if (raw === null) storage.removeItem(key);
        else storage.setItem(key, raw);
        unsaved.delete(key);
      } catch {
        unsaved.set(key, raw);
      }
      notify(key);
    },
    subscribe(key, listener) {
      const keyListeners = listeners.get(key) ?? new Set();
      keyListeners.add(listener);
      listeners.set(key, keyListeners);
      return () => {
        keyListeners.delete(listener);
        if (keyListeners.size === 0) listeners.delete(key);
      };
    },
    notify,
  };
}

export type Updater<T, D> = T | ((prev: T | D) => T);

export interface PersistedValue<T, D> {
  /** Referentially stable while the stored string is unchanged, as `useSyncExternalStore` requires. */
  get: () => T | D;
  set: (next: Updater<T, D>) => void;
  /** Forget the stored value, so `get` returns the default. */
  remove: () => void;
  subscribe: (listener: () => void) => () => void;
}

/** One key of `store`, decoded with `codec`; missing or invalid stored values read as `defaultValue`. */
export function createPersistedValue<T, D = T>(
  store: KeyValueStore,
  key: string,
  defaultValue: D,
  codec: Codec<T>,
): PersistedValue<T, D> {
  let cached: { raw: string | null; value: T | D } | undefined;

  const decode = (raw: string | null): T | D => {
    if (raw === null) return defaultValue;
    try {
      return codec.parse(raw) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const get = () => {
    const raw = store.read(key);
    if (cached?.raw !== raw) cached = { raw, value: decode(raw) };
    return cached.value;
  };

  return {
    get,
    set(next) {
      const value = typeof next === 'function' ? (next as (prev: T | D) => T)(get()) : next;
      store.write(key, codec.serialize(value));
    },
    remove: () => store.write(key, null),
    subscribe: (listener) => store.subscribe(key, listener),
  };
}
