import request from '../request'

export const achievementApi = {
  list(params?: Record<string, unknown>) {
    return request.get('/achievement/list', { params })
  },
  create(data: Record<string, unknown>) {
    return request.post('/achievement', data)
  },
  update(id: number, data: Record<string, unknown>) {
    return request.put(`/achievement/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/achievement/${id}`)
  },
  grant(id: number, userId: number) {
    return request.post(`/achievement/${id}/grant/${userId}`)
  },
}
