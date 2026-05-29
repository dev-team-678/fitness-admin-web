import request from '../request'

export const sensitiveWordApi = {
  list(params?: Record<string, unknown>) {
    return request.get('/sensitive-words', { params })
  },
  create(data: { word: string; category?: string }) {
    return request.post('/sensitive-words', data)
  },
  delete(id: number) {
    return request.delete(`/sensitive-words/${id}`)
  },
}
