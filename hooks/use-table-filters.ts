import { useCallback, useEffect, useEffectEvent, useMemo, useState } from "react"
import { useQueryStates } from "nuqs"

import type { Filter, FilterFieldConfig } from "@/components/reui/filters"
import { filterValuesParser } from "@/config/search-params"
import { applyFilters } from "@/lib/filter-engine"

interface UseTableFiltersOptions<TRow extends Record<string, unknown>> {
  tableData: TRow[]
  fields: FilterFieldConfig[]
  debounceMs?: number
  onFiltersChange?: (filters: Filter[]) => void
}

const defaultOperatorFor = (field: FilterFieldConfig | undefined): string =>
  field?.defaultOperator || (field?.type === "multiselect" ? "is_any_of" : "is")

// The URL only stores values, so restored filters use each field's default operator.
// IDs come from the field key (not `createFilter`'s random id) so server and client renders match.
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

const sameQueryStates = (
  a: Record<string, string[] | null>,
  b: Record<string, string[] | null>
): boolean =>
  Object.keys({ ...a, ...b }).every((key) => {
    const left = a[key] ?? []
    const right = b[key] ?? []
    return left.length === right.length && left.every((value, i) => value === right[i])
  })

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
        .map((key) => [key, filterValuesParser])
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

  const [filters, setFilters] = useState<Filter[]>(() =>
    filtersFromQueryStates(queryStates, fieldsMap)
  )

  // Debounced so the controlled filter inputs stay responsive while the plot and colour maps catch up.
  const [appliedFilters, setAppliedFilters] = useState<Filter[]>(filters)

  useEffect(() => {
    if (filters === appliedFilters) return

    const timer = setTimeout(() => {
      setAppliedFilters(filters)
      setQueryStates(toQueryStates(filters, queryStateKeys))
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [filters, appliedFilters, debounceMs, queryStateKeys, setQueryStates])

  const adoptUrlChangeMadeElsewhere = useEffectEvent(
    (urlStates: Record<string, string[] | null>) => {
      if (sameQueryStates(toQueryStates(appliedFilters, queryStateKeys), urlStates)) return
      const next = filtersFromQueryStates(urlStates, fieldsMap)
      setFilters(next)
      setAppliedFilters(next)
    }
  )

  useEffect(() => {
    adoptUrlChangeMadeElsewhere(queryStates)
  }, [queryStates])

  const filteredData = useMemo(() => {
    // A field's dataKey is the row attribute it filters on, e.g. customList filters genotypeID.
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
    const noFilters: Filter[] = []
    setFilters(noFilters)
    setAppliedFilters(noFilters)
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
