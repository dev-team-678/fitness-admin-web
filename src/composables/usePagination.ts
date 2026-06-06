import { ref, reactive } from 'vue'

export function usePagination(fetchFn: (params: Record<string, unknown>) => Promise<unknown>) {
  const loading = ref(false)
  const tableData = ref<unknown[]>([])
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0,
  })

  async function loadData(extraParams: Record<string, unknown> = {}) {
    loading.value = true
    try {
      const res = await fetchFn({
        pageNum: pagination.page,
        pageSize: pagination.pageSize,
        ...extraParams,
      })
      const responseData = (res as { data: { list: unknown[]; total: number } }).data
      tableData.value = responseData?.list || []
      pagination.total = responseData?.total || 0
    } finally {
      loading.value = false
    }
  }

  function handleCurrentChange(page: number) {
    pagination.page = page
    loadData()
  }

  function handleSizeChange(size: number) {
    pagination.pageSize = size
    pagination.page = 1
    loadData()
  }

  function resetPage() {
    pagination.page = 1
  }

  return { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange, resetPage }
}
