import type { Codec } from '@/lib/persisted-store';

export const stringCodec: Codec<string> = {
  parse: (raw) => raw,
  serialize: (value) => value,
};

export function oneOfCodec<V extends string>(values: Iterable<V>): Codec<V> {
  const allowed = new Set<string>(values);
  return {
    parse: (raw) => (allowed.has(raw) ? (raw as V) : undefined),
    serialize: (value) => value,
  };
}

/** Stored as `"true"` / `"false"`. */
export const booleanCodec: Codec<boolean> = {
  parse: (raw) => (raw === 'true' || raw === 'false' ? raw === 'true' : undefined),
  serialize: String,
};

/** Stored as a whole number; zero, negative and non-numeric values are invalid. */
export const positiveIntegerCodec: Codec<number> = {
  parse: (raw) => {
    const value = Math.round(Number(raw));
    return Number.isFinite(value) && value > 0 ? value : undefined;
  },
  serialize: (value) => String(Math.round(value)),
};

/** Stored as JSON; `toValue` validates the parsed JSON, returning `undefined` if it's invalid. */
export function jsonCodec<T>(toValue: (json: unknown) => T | undefined): Codec<T> {
  return {
    parse: (raw) => toValue(JSON.parse(raw)),
    serialize: (value) => JSON.stringify(value),
  };
}
