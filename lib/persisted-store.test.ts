import { describe, expect, mock, test } from "bun:test"
import { createKeyValueStore, createPersistedValue, type StorageLike } from "@/lib/persisted-store"
import { booleanCodec, jsonCodec, stringCodec } from "@/lib/storage-codecs"
import { isStringArray } from "@/lib/type-guards"

function fakeStorage(initial: Record<string, string> = {}) {
  const items = new Map(Object.entries(initial))
  const storage: StorageLike = {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
  }
  return { storage, items }
}

const throwingStorage: StorageLike = {
  getItem: () => { throw new Error("SecurityError") },
  setItem: () => { throw new Error("QuotaExceededError") },
  removeItem: () => { throw new Error("SecurityError") },
}

const stringListCodec = jsonCodec((json) => (isStringArray(json) ? json : undefined))

describe("createKeyValueStore", () => {
  test("reads, writes and removes raw strings", () => {
    const { storage, items } = fakeStorage({ a: "1" })
    const store = createKeyValueStore(() => storage)
    expect(store.read("a")).toBe("1")
    expect(store.read("missing")).toBeNull()
    store.write("a", "2")
    expect(items.get("a")).toBe("2")
    store.write("a", null)
    expect(items.has("a")).toBe(false)
  })

  test("notifies only the written key's listeners, until they unsubscribe", () => {
    const { storage } = fakeStorage()
    const store = createKeyValueStore(() => storage)
    const onA = mock(() => {})
    const onB = mock(() => {})
    const unsubscribeA = store.subscribe("a", onA)
    store.subscribe("b", onB)
    store.write("a", "x")
    expect(onA).toHaveBeenCalledTimes(1)
    expect(onB).not.toHaveBeenCalled()
    unsubscribeA()
    store.write("a", "y")
    expect(onA).toHaveBeenCalledTimes(1)
  })

  test("notify(null) reaches every key's listeners", () => {
    const { storage } = fakeStorage()
    const store = createKeyValueStore(() => storage)
    const onA = mock(() => {})
    const onB = mock(() => {})
    store.subscribe("a", onA)
    store.subscribe("b", onB)
    store.notify(null)
    expect(onA).toHaveBeenCalledTimes(1)
    expect(onB).toHaveBeenCalledTimes(1)
  })

  test("never throws when storage throws or is missing, and keeps failed writes in memory", () => {
    for (const getStorage of [() => throwingStorage, () => undefined]) {
      const store = createKeyValueStore(getStorage)
      const listener = mock(() => {})
      store.subscribe("a", listener)
      expect(store.read("a")).toBeNull()
      store.write("a", "kept")
      expect(store.read("a")).toBe("kept")
      expect(listener).toHaveBeenCalledTimes(1)
      store.write("a", null)
      expect(store.read("a")).toBeNull()
    }
  })

  test("a successful write replaces an earlier failed one", () => {
    let fail = true
    const { storage } = fakeStorage()
    const store = createKeyValueStore(() => (fail ? throwingStorage : storage))
    store.write("a", "memory")
    fail = false
    store.write("a", "saved")
    storage.setItem("a", "changed by another tab")
    expect(store.read("a")).toBe("changed by another tab")
  })
})

describe("createPersistedValue", () => {
  test("returns the default when nothing is stored, the server-less case included", () => {
    const value = createPersistedValue(createKeyValueStore(() => undefined), "flag", false, booleanCodec)
    expect(value.get()).toBe(false)
  })

  test("decodes the stored value", () => {
    const { storage } = fakeStorage({ flag: "true", list: '["a","b"]' })
    const store = createKeyValueStore(() => storage)
    expect(createPersistedValue(store, "flag", false, booleanCodec).get()).toBe(true)
    expect(createPersistedValue(store, "list", [], stringListCodec).get()).toEqual(["a", "b"])
  })

  test("falls back to the default for invalid or unparseable stored values", () => {
    const { storage } = fakeStorage({ flag: "yes", list: "[1,2]", broken: "{not json" })
    const store = createKeyValueStore(() => storage)
    const empty: string[] = []
    expect(createPersistedValue(store, "flag", false, booleanCodec).get()).toBe(false)
    expect(createPersistedValue(store, "list", empty, stringListCodec).get()).toBe(empty)
    expect(createPersistedValue(store, "broken", empty, stringListCodec).get()).toBe(empty)
  })

  test("returns the same object until the stored string changes", () => {
    const { storage } = fakeStorage({ list: '["a"]' })
    const value = createPersistedValue(createKeyValueStore(() => storage), "list", [], stringListCodec)
    const first = value.get()
    expect(value.get()).toBe(first)
    value.set(["a"])
    expect(value.get()).toBe(first)
    value.set(["b"])
    expect(value.get()).not.toBe(first)
    expect(value.get()).toEqual(["b"])
  })

  test("set serializes with the codec and accepts an updater of the current value", () => {
    const { storage, items } = fakeStorage({ list: '["a"]' })
    const value = createPersistedValue(createKeyValueStore(() => storage), "list", [], stringListCodec)
    value.set((prev) => [...prev, "b"])
    expect(items.get("list")).toBe('["a","b"]')
    expect(value.get()).toEqual(["a", "b"])
  })

  test("remove forgets the stored value and notifies subscribers", () => {
    const { storage, items } = fakeStorage({ text: "hello" })
    const value = createPersistedValue(createKeyValueStore(() => storage), "text", "", stringCodec)
    const listener = mock(() => {})
    value.subscribe(listener)
    value.remove()
    expect(items.has("text")).toBe(false)
    expect(value.get()).toBe("")
    expect(listener).toHaveBeenCalledTimes(1)
  })

  test("the default can be a different type from stored values", () => {
    const { storage } = fakeStorage()
    const value = createPersistedValue<string, null>(createKeyValueStore(() => storage), "text", null, stringCodec)
    expect(value.get()).toBeNull()
    value.set((prev) => `${prev ?? "none"}!`)
    expect(value.get()).toBe("none!")
  })

  test("values sharing a store and key see each other's writes", () => {
    const { storage } = fakeStorage()
    const store = createKeyValueStore(() => storage)
    const a = createPersistedValue(store, "flag", false, booleanCodec)
    const b = createPersistedValue(store, "flag", false, booleanCodec)
    const onB = mock(() => {})
    b.subscribe(onB)
    a.set(true)
    expect(onB).toHaveBeenCalledTimes(1)
    expect(b.get()).toBe(true)
  })
})
