import request from '../request'

export const exerciseApi = {
  list(params: Record<string, unknown>) {
    return request.get('/exercises', { params })
  },
  create(data: Record<string, unknown>) {
    return request.post('/exercises', data)
  },
  detail(id: number) {
    return request.get(`/exercises/${id}`)
  },
  update(id: number, data: Record<string, unknown>) {
    return request.put(`/exercises/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/exercises/${id}`)
  },
}
