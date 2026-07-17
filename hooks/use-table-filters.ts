import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs"

import { type Filter, type FilterFieldConfig } from "@/components/reui/filters"
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

export function useTableFilters<TRow extends Record<string, unknown>>({
  tableData,
  fields,
  debounceMs = 250,
  onFiltersChange,
}: UseTableFiltersOptions<TRow>) {
  const urlDebounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current)
    }
  }, [])

  const queryStateParsers = useMemo(() => {
    return Object.fromEntries(
      fields
        .map((field) => field.key)
        .filter((key): key is string => Boolean(key))
        .map((key) => [key, parseAsArrayOf(parseAsString)])
    )
  }, [fields])

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

  const filteredData = useMemo(() => {
    // Remap filter.field to the field's dataKey (if provided) so the engine
    // reads from the correct row attribute. This lets a field have a logical
    // identity (e.g. "customList") that's distinct from the underlying data
    // key it filters on (e.g. "genotypeID").
    const resolvedFilters = filters.map((filter) => {
      const dataKey = fieldsMap[filter.field]?.dataKey
      return dataKey ? { ...filter, field: dataKey } : filter
    })
    return applyFilters<TRow>(tableData, resolvedFilters)
  }, [tableData, filters, fieldsMap])

  const handleFiltersChange = useCallback(
    (newFilters: Filter[]) => {
      setFilters(newFilters)
      onFiltersChange?.(newFilters)

      if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current)
      urlDebounceRef.current = setTimeout(() => {
        const next: Record<string, string[] | null> = {}
        Object.keys(queryStates).forEach((key) => {
          next[key] = null
        })

        newFilters.forEach(({ field, values }) => {
          const cleanValues = (values || [])
            .map((value) => String(value))
            .filter((value) => value.trim() !== "")
          next[field] = cleanValues.length > 0 ? cleanValues : null
        })

        setQueryStates(next)
      }, debounceMs)
    },
    [debounceMs, onFiltersChange, queryStates, setQueryStates]
  )

  const clearFilters = useCallback(() => {
    setFilters([])
    onFiltersChange?.([])

    const clearedStates: Record<string, null> = {}
    Object.keys(queryStates).forEach((key) => {
      clearedStates[key] = null
    })
    setQueryStates(clearedStates)
  }, [onFiltersChange, queryStates, setQueryStates])

  return {
    filters,
    filteredData,
    handleFiltersChange,
    clearFilters,
  }
}
