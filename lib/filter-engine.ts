import type { Filter } from "@/components/reui/filters"

const isActiveFilter = (filter: Filter): boolean => {
  if (filter.operator === "empty" || filter.operator === "not_empty") {
    return true
  }

  if (Array.isArray(filter.values)) {
    return filter.values.length > 0
  }
  return Boolean(filter.values)
}

const isValueEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === "string") return value.trim() === ""
  if (Array.isArray(value)) return value.length === 0
  return false
}

const matchesFilter = <TRow extends Record<string, unknown>>(
  row: TRow,
  filter: Filter
): boolean => {
  const { field, operator, values } = filter
  const fieldValue = row[field as keyof TRow]

  switch (operator) {
    case "is":
      return values.includes(fieldValue)
    case "is_not":
      return !values.includes(fieldValue)
    case "contains":
      return values.some((value) =>
        String(fieldValue).toLowerCase().includes(String(value).toLowerCase())
      )
    case "not_contains":
      return !values.some((value) =>
        String(fieldValue).toLowerCase().includes(String(value).toLowerCase())
      )
    case "starts_with":
      if (values.length === 0) return true
      return String(fieldValue)
        .toLowerCase()
        .startsWith(String(values[0]).toLowerCase())
    case "ends_with":
      if (values.length === 0) return true
      return String(fieldValue)
        .toLowerCase()
        .endsWith(String(values[0]).toLowerCase())
    case "equals":
      return fieldValue === values[0]
    case "not_equals":
      return fieldValue !== values[0]
    case "greater_than":
      return Number(fieldValue) > Number(values[0])
    case "less_than":
      return Number(fieldValue) < Number(values[0])
    case "greater_than_or_equal":
      return Number(fieldValue) >= Number(values[0])
    case "less_than_or_equal":
      return Number(fieldValue) <= Number(values[0])
    case "between":
      if (values.length >= 2) {
        const min = Number(values[0])
        const max = Number(values[1])
        return Number(fieldValue) >= min && Number(fieldValue) <= max
      }
      return true
    case "not_between":
      if (values.length >= 2) {
        const min = Number(values[0])
        const max = Number(values[1])
        return Number(fieldValue) < min || Number(fieldValue) > max
      }
      return true
    case "before":
      return new Date(String(fieldValue)) < new Date(String(values[0]))
    case "after":
      return new Date(String(fieldValue)) > new Date(String(values[0]))
    case "empty":
      return isValueEmpty(fieldValue)
    case "not_empty":
      return !isValueEmpty(fieldValue)
    default:
      return true
  }
}

export const applyFilters = <TRow extends Record<string, unknown>>(
  rows: TRow[],
  filters: Filter[]
): TRow[] => {
  const activeFilters = filters.filter(isActiveFilter)
  if (activeFilters.length === 0) return rows

  return activeFilters.reduce<TRow[]>(
    (filteredRows, filter) =>
      filteredRows.filter((row) => matchesFilter(row, filter)),
    [...rows]
  )
}
