import request from '../request'

export const sensitiveWordApi = {
  list(params?: Record<string, unknown>) {
    return request.get('/sensitive-word/list', { params })
  },
  create(data: { word: string; category?: string }) {
    return request.post('/sensitive-word', data)
  },
  delete(id: number) {
    return request.delete(`/sensitive-word/${id}`)
  },
}
