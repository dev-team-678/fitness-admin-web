import request from '../request'

export const userApi = {
  list(params: Record<string, unknown>) {
    return request.get('/users', { params })
  },
  detail(id: number) {
    return request.get(`/users/${id}`)
  },
  update(id: number, data: Record<string, unknown>) {
    return request.put(`/users/${id}`, data)
  },
  updateStatus(id: number, data: { status: string; reason?: string }) {
    return request.put(`/users/${id}/status`, data)
  },
  batchStatus(data: { user_ids: number[]; status: string; reason?: string }) {
    return request.put('/users/batch-status', data)
  },
  getWorkouts(id: number, params?: Record<string, unknown>) {
    return request.get(`/users/${id}/workouts`, { params })
  },
  getBodyMetrics(id: number) {
    return request.get(`/users/${id}/body-metrics`)
  },
  getAchievements(id: number) {
    return request.get(`/users/${id}/achievements`)
  },
  getAiProfile(id: number) {
    return request.get(`/users/${id}/ai-profile`)
  },
  getAiChats(id: number, params?: Record<string, unknown>) {
    return request.get(`/users/${id}/ai-chats`, { params })
  },
  export(params?: Record<string, unknown>) {
    return request.get('/users/export', { params, responseType: 'blob' })
  },
}
