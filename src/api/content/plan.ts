import request from '../request'

export const planApi = {
  list(params: Record<string, unknown>) {
    return request.get('/plans', { params })
  },
  create(data: Record<string, unknown>) {
    return request.post('/plans', data)
  },
  detail(id: number) {
    return request.get(`/plans/${id}`)
  },
  update(id: number, data: Record<string, unknown>) {
    return request.put(`/plans/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/plans/${id}`)
  },
  updateStatus(id: number, data: { status: number }) {
    return request.put(`/plans/${id}/status`, data)
  },
  copy(id: number) {
    return request.post(`/plans/${id}/copy`)
  },
  stats(id: number) {
    return request.get(`/plans/${id}/stats`)
  },
}
