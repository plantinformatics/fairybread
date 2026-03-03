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

export function useTableFilters<TRow extends Record<string, unknown>>({
  tableData,
  fields,
  debounceMs = 250,
  onFiltersChange,
}: UseTableFiltersOptions<TRow>) {
  const [filters, setFilters] = useState<Filter[]>([])
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

  const filteredData = useMemo(() => {
    return applyFilters<TRow>(tableData, filters)
  }, [tableData, filters])

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
