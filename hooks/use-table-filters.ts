import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs"

import type { Filter, FilterFieldConfig } from "@/components/reui/filters"
import { applyFilters } from "@/lib/filter-engine"

interface UseTableFiltersOptions<TRow extends Record<string, unknown>> {
  tableData: TRow[]
  fields: FilterFieldConfig[]
  debounceMs?: number
  onFiltersChange?: (filters: Filter[]) => void
}

const defaultOperatorFor = (field: FilterFieldConfig | undefined): string =>
  field?.defaultOperator || (field?.type === "multiselect" ? "is_any_of" : "is")

// Rebuilds the `Filter[]` shape the UI expects from the raw `field -> values`
// map nuqs restores from the URL. Operators aren't persisted in the URL (only
// values are), so restored filters fall back to each field's default operator.
// IDs are derived from the field key rather than `createFilter`'s time/random
// id, so the same URL always produces the same id on both the server render
// pass and the client hydration pass.
const filtersFromQueryStates = (
  queryStates: Record<string, string[] | null>,
  fieldsMap: Record<string, FilterFieldConfig>
): Filter[] =>
  Object.entries(queryStates)
    .filter(([, values]) => Boolean(values && values.length > 0))
    .map(([field, values]) => ({
      id: `url:${field}`,
      field,
      operator: defaultOperatorFor(fieldsMap[field]),
      values: values ?? [],
    }))

const toQueryStates = (
  filters: Filter[],
  keys: string[]
): Record<string, string[] | null> => {
  const next: Record<string, string[] | null> = {}
  keys.forEach((key) => {
    next[key] = null
  })

  filters.forEach(({ field, values }) => {
    const cleanValues = (values || [])
      .map((value) => String(value))
      .filter((value) => value.trim() !== "")
    next[field] = cleanValues.length > 0 ? cleanValues : null
  })

  return next
}

export function useTableFilters<TRow extends Record<string, unknown>>({
  tableData,
  fields,
  debounceMs = 250,
  onFiltersChange,
}: UseTableFiltersOptions<TRow>) {
  const queryStateParsers = useMemo(() => {
    return Object.fromEntries(
      fields
        .map((field) => field.key)
        .filter((key): key is string => Boolean(key))
        .map((key) => [key, parseAsArrayOf(parseAsString)])
    )
  }, [fields])

  const queryStateKeys = useMemo(
    () => Object.keys(queryStateParsers),
    [queryStateParsers]
  )

  const [queryStates, setQueryStates] = useQueryStates(queryStateParsers, {
    history: "push",
  })

  const fieldsMap = useMemo(() => {
    const map: Record<string, FilterFieldConfig> = {}
    fields.forEach((field) => {
      if (field.key) map[field.key] = field
    })
    return map
  }, [fields])

  // Restore any filters already present in the URL (e.g. a shared link, or a
  // refresh) on first render, instead of only reflecting them in the URL.
  const [filters, setFilters] = useState<Filter[]>(() =>
    filtersFromQueryStates(queryStates, fieldsMap)
  )

  // Debounced copy used for expensive work (filtered rows → plot / colour maps).
  // `filters` stays immediate so the controlled text inputs remain responsive.
  const [appliedFilters, setAppliedFilters] = useState<Filter[]>(filters)
  const skipNextApplyRef = useRef(false)

  useEffect(() => {
    // clearFilters applies synchronously and sets this so we don't schedule a
    // second (debounced) write of the same empty state.
    if (skipNextApplyRef.current) {
      skipNextApplyRef.current = false
      return
    }

    // Same reference ⇒ nothing to apply (initial mount, or just-applied update).
    if (filters === appliedFilters) return

    const timer = setTimeout(() => {
      setAppliedFilters(filters)
      setQueryStates(toQueryStates(filters, queryStateKeys))
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [filters, appliedFilters, debounceMs, queryStateKeys, setQueryStates])

  const filteredData = useMemo(() => {
    // Remap filter.field to the field's dataKey (if provided) so the engine
    // reads from the correct row attribute. This lets a field have a logical
    // identity (e.g. "customList") that's distinct from the underlying data
    // key it filters on (e.g. "genotypeID").
    const resolvedFilters = appliedFilters.map((filter) => {
      const dataKey = fieldsMap[filter.field]?.dataKey
      return dataKey ? { ...filter, field: dataKey } : filter
    })
    return applyFilters<TRow>(tableData, resolvedFilters)
  }, [tableData, appliedFilters, fieldsMap])

  const handleFiltersChange = useCallback(
    (newFilters: Filter[]) => {
      setFilters(newFilters)
      onFiltersChange?.(newFilters)
    },
    [onFiltersChange]
  )

  const clearFilters = useCallback(() => {
    // Apply immediately so clear doesn't wait for the debounce window.
    skipNextApplyRef.current = true
    setFilters([])
    setAppliedFilters([])
    onFiltersChange?.([])
    setQueryStates(toQueryStates([], queryStateKeys))
  }, [onFiltersChange, queryStateKeys, setQueryStates])

  return {
    filters,
    appliedFilters,
    filteredData,
    handleFiltersChange,
    clearFilters,
  }
}
