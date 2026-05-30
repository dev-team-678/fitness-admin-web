import request from '../request'

export const promptApi = {
  list(params?: Record<string, unknown>) {
    return request.get('/ai-safety/prompts', { params })
  },
  create(data: Record<string, unknown>) {
    return request.post('/ai-safety/prompt', data)
  },
  detail(id: number) {
    return request.get(`/ai-safety/prompt/${id}`)
  },
  update(id: number, data: Record<string, unknown>) {
    return request.put(`/ai-safety/prompt/${id}`, data)
  },
  activate(id: number) {
    return request.put(`/ai-safety/prompt/${id}/activate`)
  },
  versions(id: number) {
    return request.get(`/ai-safety/prompt/${id}/versions`)
  },
  rollback(id: number) {
    return request.post(`/ai-safety/prompt/${id}/rollback`)
  },
}
