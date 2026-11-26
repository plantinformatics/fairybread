import { afterAll, beforeEach, expect, test } from "bun:test"
import {
  DEFAULT_PC_AXES,
  createLocalStorageStore,
  parseStoredBoolean,
  parseStoredPcAxes,
  parseStoredStringArray,
} from "@/lib/local-storage-store"

// Minimal browser stand-in: a Map-backed localStorage plus storage-event listeners.
const data = new Map<string, string>()
const storageListeners = new Set<(event: { key: string | null }) => void>()

beforeEach(() => {
  data.clear()
  storageListeners.clear()
  Object.assign(globalThis, {
    window: {
      localStorage: {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => void data.set(key, value),
      },
      addEventListener: (_type: string, listener: (event: { key: string | null }) => void) =>
        storageListeners.add(listener),
      removeEventListener: (_type: string, listener: (event: { key: string | null }) => void) =>
        storageListeners.delete(listener),
    },
  })
})

// Other test files share this process, so don't leave a fake `window` behind.
afterAll(() => {
  delete (globalThis as { window?: unknown }).window
})

const listStore = () => createLocalStorageStore("list", parseStoredStringArray, JSON.stringify)

test("parseStoredBoolean accepts only 'true'/'false'", () => {
  expect(parseStoredBoolean("true", false)).toBe(true)
  expect(parseStoredBoolean("false", true)).toBe(false)
  expect(parseStoredBoolean(null, true)).toBe(true)
  expect(parseStoredBoolean("yes", false)).toBe(false)
})

test("parseStoredStringArray falls back to [] for corrupted or wrong-shaped data", () => {
  expect(parseStoredStringArray('["a","b"]')).toEqual(["a", "b"])
  expect(parseStoredStringArray(null)).toEqual([])
  expect(parseStoredStringArray("{not json")).toEqual([])
  expect(parseStoredStringArray("[1,2]")).toEqual([])
  expect(parseStoredStringArray('{"a":1}')).toEqual([])
})

test("parseStoredPcAxes falls back to defaults per field", () => {
  expect(parseStoredPcAxes('{"x":"PC3","y":"PC4","z":"PC5"}')).toEqual({ x: "PC3", y: "PC4", z: "PC5" })
  expect(parseStoredPcAxes('{"x":"PC11","y":"PC4","z":7}')).toEqual({ x: "PC1", y: "PC4", z: null })
  expect(parseStoredPcAxes(null)).toBe(DEFAULT_PC_AXES)
  expect(parseStoredPcAxes("oops")).toBe(DEFAULT_PC_AXES)
  expect(parseStoredPcAxes("null")).toBe(DEFAULT_PC_AXES)
})

test("snapshots are referentially stable while the raw value is unchanged", () => {
  data.set("list", '["a"]')
  const store = listStore()
  const first = store.getSnapshot()
  expect(first).toEqual(["a"])
  expect(store.getSnapshot()).toBe(first)

  data.set("list", '["a","b"]')
  const second = store.getSnapshot()
  expect(second).toEqual(["a", "b"])
  expect(store.getSnapshot()).toBe(second)
})

test("set writes the serialized value and notifies subscribers", () => {
  const store = listStore()
  let calls = 0
  const unsubscribe = store.subscribe(() => calls++)
  store.set(["x"])
  expect(data.get("list")).toBe('["x"]')
  expect(store.getSnapshot()).toEqual(["x"])
  expect(calls).toBe(1)

  unsubscribe()
  store.set(["y"])
  expect(calls).toBe(1)
})

test("storage events for this key (or a clear) notify; other keys don't", () => {
  const store = listStore()
  let calls = 0
  const unsubscribe = store.subscribe(() => calls++)
  storageListeners.forEach((l) => l({ key: "other" }))
  expect(calls).toBe(0)
  storageListeners.forEach((l) => l({ key: "list" }))
  storageListeners.forEach((l) => l({ key: null }))
  expect(calls).toBe(2)

  unsubscribe()
  expect(storageListeners.size).toBe(0)
})

test("server snapshot is the default, or the given server value", () => {
  data.set("list", '["a"]')
  expect(listStore().getServerSnapshot()).toEqual([])
  const theme = createLocalStorageStore("theme", (raw) => raw !== "light", String, false)
  expect(theme.getSnapshot()).toBe(true)
  expect(theme.getServerSnapshot()).toBe(false)
})
