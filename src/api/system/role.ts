import request from '../request'

export const roleApi = {
  list(params?: Record<string, unknown>) {
    return request.get('/admin-role/list', { params })
  },
  create(data: { name: string; permissions: string[] }) {
    return request.post('/admin-role', data)
  },
  update(id: number, data: { name: string; permissions: string[] }) {
    return request.put(`/admin-role/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/admin-role/${id}`)
  },
}
