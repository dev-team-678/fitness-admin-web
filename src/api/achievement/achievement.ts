import request from '../request'

export const achievementApi = {
  list(params?: Record<string, unknown>) {
    return request.get('/achievements', { params })
  },
  create(data: Record<string, unknown>) {
    return request.post('/achievements', data)
  },
  update(id: number, data: Record<string, unknown>) {
    return request.put(`/achievements/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/achievements/${id}`)
  },
  grant(id: number, userId: number) {
    return request.post(`/achievements/${id}/grant/${userId}`)
  },
}
