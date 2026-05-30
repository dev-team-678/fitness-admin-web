import request from '../request'

export const adminApi = {
  list(params: Record<string, unknown>) {
    return request.get('/admin-role/list', { params })
  },
  create(data: Record<string, unknown>) {
    return request.post('/admin-role', data)
  },
  update(id: number, data: Record<string, unknown>) {
    return request.put(`/admin-role/${id}`, data)
  },
  updateStatus(id: number, data: { status: number }) {
    return request.put(`/admin-role/${id}/status`, data)
  },
  resetPassword(id: number) {
    return request.post(`/admin-role/${id}/reset-password`)
  },
  loginLogs(params: Record<string, unknown>) {
    return request.get('/operation-log/list', { params })
  },
}
