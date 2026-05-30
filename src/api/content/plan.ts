import request from '../request'

export const planApi = {
  list(params: Record<string, unknown>) {
    return request.get('/plan/list', { params })
  },
  create(data: Record<string, unknown>) {
    return request.post('/plan', data)
  },
  detail(id: number) {
    return request.get(`/plan/${id}`)
  },
  update(id: number, data: Record<string, unknown>) {
    return request.put(`/plan/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/plan/${id}`)
  },
  updateStatus(id: number, data: { status: number }) {
    return request.put(`/plan/${id}/status`, data)
  },
  copy(id: number) {
    return request.post(`/plan/${id}/copy`)
  },
  stats(id: number) {
    return request.get(`/plan/${id}/stats`)
  },
}
