import request from '../request'

export const exerciseApi = {
  list(params: Record<string, unknown>) {
    return request.get('/exercise/list', { params })
  },
  create(data: Record<string, unknown>) {
    return request.post('/exercise', data)
  },
  detail(id: number) {
    return request.get(`/exercise/${id}`)
  },
  update(id: number, data: Record<string, unknown>) {
    return request.put(`/exercise/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/exercise/${id}`)
  },
}
