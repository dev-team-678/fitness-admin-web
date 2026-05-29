import request from '../request'

export const promptApi = {
  list(params?: Record<string, unknown>) {
    return request.get('/ai/prompts', { params })
  },
  create(data: Record<string, unknown>) {
    return request.post('/ai/prompts', data)
  },
  detail(id: number) {
    return request.get(`/ai/prompts/${id}`)
  },
  update(id: number, data: Record<string, unknown>) {
    return request.put(`/ai/prompts/${id}`, data)
  },
  activate(id: number) {
    return request.put(`/ai/prompts/${id}/activate`)
  },
  versions(id: number) {
    return request.get(`/ai/prompts/${id}/versions`)
  },
  rollback(id: number) {
    return request.post(`/ai/prompts/${id}/rollback`)
  },
}
