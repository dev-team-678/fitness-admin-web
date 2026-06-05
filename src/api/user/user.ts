import request from '../request'

export const userApi = {
  list(params: Record<string, unknown>) {
    return request.get('/user/list', { params })
  },
  detail(id: number) {
    return request.get(`/user/${id}`)
  },
  update(data: Record<string, unknown>) {
    return request.put('/user', data)
  },
  updateStatus(id: number, data: { status: number; reason?: string }) {
    return request.put(`/user/${id}/status`, data)
  },
  batchStatus(data: { user_ids: number[]; status: number; reason?: string }) {
    return request.put('/user/batch-status', data)
  },
  getWorkouts(id: number, params?: Record<string, unknown>) {
    return request.get(`/user/${id}/workouts`, { params })
  },
  getBodyMetrics(id: number) {
    return request.get(`/user/${id}/body-metrics`)
  },
  getAchievements(id: number) {
    return request.get(`/user/${id}/achievements`)
  },
  getAiProfile(id: number) {
    return request.get(`/user/${id}/ai-profile`)
  },
  getAiChats(id: number, params?: Record<string, unknown>) {
    return request.get(`/user/${id}/ai-chats`, { params })
  },
  export(params?: Record<string, unknown>) {
    return request.get('/user/export', { params, responseType: 'blob' })
  },
  tags() {
    return request.get('/user/tags')
  },
  saveTag(data: Record<string, unknown>) {
    return request.post('/user/tag', data)
  },
  deleteTag(id: number) {
    return request.delete(`/user/tag/${id}`)
  },
}
