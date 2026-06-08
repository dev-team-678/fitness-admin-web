import request from '../request'

export const adminApi = {
  list(params: Record<string, unknown>) {
    return request.get('/admin-user/list', { params })
  },
  create(data: Record<string, unknown>) {
    return request.post('/admin-user', data)
  },
  update(id: number, data: Record<string, unknown>) {
    return request.put(`/admin-user/${id}`, data)
  },
  updateStatus(id: number, data: { status: number }) {
    return request.put(`/admin-user/${id}/status`, data)
  },
  resetPassword(id: number) {
    return request.post(`/admin-user/${id}/reset-password`)
  },
  loginLogs(params: Record<string, unknown>) {
    return request.get('/login-log/list', { params })
  },
}
