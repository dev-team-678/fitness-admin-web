import request from '../request'

export const adminApi = {
  list(params: Record<string, unknown>) {
    return request.get('/admins', { params })
  },
  create(data: Record<string, unknown>) {
    return request.post('/admins', data)
  },
  update(id: number, data: Record<string, unknown>) {
    return request.put(`/admins/${id}`, data)
  },
  updateStatus(id: number, data: { status: number }) {
    return request.put(`/admins/${id}/status`, data)
  },
  resetPassword(id: number) {
    return request.post(`/admins/${id}/reset-password`)
  },
  loginLogs(params: Record<string, unknown>) {
    return request.get('/login-logs', { params })
  },
}
