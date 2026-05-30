import request from '../request'

export const knowledgeApi = {
  list(params: Record<string, unknown>) {
    return request.get('/ai-knowledge/list', { params })
  },
  create(data: Record<string, unknown>) {
    return request.post('/ai-knowledge', data)
  },
  detail(id: number) {
    return request.get(`/ai-knowledge/${id}`)
  },
  update(id: number, data: Record<string, unknown>) {
    return request.put(`/ai-knowledge/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/ai-knowledge/${id}`)
  },
  batchImport(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/ai-knowledge/batch-import', formData)
  },
  jobProgress(jobId: string) {
    return request.get(`/ai-knowledge/jobs/${jobId}`)
  },
  getCategories() {
    return request.get('/ai-knowledge/categories')
  },
  createCategory(data: { name: string; code: string }) {
    return request.post('/ai-knowledge/categories', data)
  },
  retryVectorize(id: number) {
    return request.post(`/ai-knowledge/${id}/retry-vectorize`)
  },
  ragTest(data: { query: string; topK?: number }) {
    return request.post('/ai-knowledge/rag-test', data)
  },
}
