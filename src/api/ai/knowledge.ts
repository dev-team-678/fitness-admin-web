import request from '../request'

export const knowledgeApi = {
  list(params: Record<string, unknown>) {
    return request.get('/ai/knowledge', { params })
  },
  create(data: Record<string, unknown>) {
    return request.post('/ai/knowledge', data)
  },
  detail(id: number) {
    return request.get(`/ai/knowledge/${id}`)
  },
  update(id: number, data: Record<string, unknown>) {
    return request.put(`/ai/knowledge/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/ai/knowledge/${id}`)
  },
  batchImport(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/ai/knowledge/batch-import', formData)
  },
  jobProgress(jobId: string) {
    return request.get(`/ai/knowledge/jobs/${jobId}`)
  },
  getCategories() {
    return request.get('/ai/knowledge/categories')
  },
  createCategory(data: { name: string; code: string }) {
    return request.post('/ai/knowledge/categories', data)
  },
  updateCategory(id: number, data: { name: string }) {
    return request.put(`/ai/knowledge/categories/${id}`, data)
  },
  deleteCategory(id: number) {
    return request.delete(`/ai/knowledge/categories/${id}`)
  },
  ragTest(data: { query: string; topK?: number }) {
    return request.post('/ai/knowledge/rag-test', data)
  },
  vectorStatus(id: number) {
    return request.get(`/ai/knowledge/${id}/vector-status`)
  },
  retryVectorize(id: number) {
    return request.post(`/ai/knowledge/${id}/retry`)
  },
  reindex() {
    return request.post('/ai/knowledge/reindex')
  },
}
