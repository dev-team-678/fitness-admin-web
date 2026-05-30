import request from '../request'

export const reportApi = {
  list(params: Record<string, unknown>) {
    return request.get('/report/list', { params })
  },
  handle(id: number, data: { action: string; reason?: string }) {
    return request.put(`/report/${id}/handle`, data)
  },
  muteUser(id: number, data: { duration: number; reason: string }) {
    return request.post(`/community-user/${id}/mute`, data)
  },
}
