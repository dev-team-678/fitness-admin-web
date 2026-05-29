import request from '../request'

export const reportApi = {
  list(params: Record<string, unknown>) {
    return request.get('/community/reports', { params })
  },
  handle(id: number, data: { action: string; reason?: string }) {
    return request.put(`/community/reports/${id}`, data)
  },
  muteUser(id: number, data: { duration: number; reason: string }) {
    return request.post(`/community/users/${id}/mute`, data)
  },
}
