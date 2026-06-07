import { reactive, ref } from 'vue'

export function useTableSearch<T extends Record<string, unknown>>(defaultFilters: T) {
  const filters = reactive<T>({ ...defaultFilters })
  const searchText = ref('')

  function getSearchParams(): Record<string, unknown> {
    const params: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(filters)) {
      if (value !== '' && value !== null && value !== undefined && !(typeof value === 'number' && isNaN(value))) {
        params[key] = value
      }
    }
    if (searchText.value) {
      params.keyword = searchText.value
    }
    return params
  }

  function resetFilters() {
    Object.assign(filters, { ...defaultFilters })
    searchText.value = ''
  }

  return { filters, searchText, getSearchParams, resetFilters }
}
