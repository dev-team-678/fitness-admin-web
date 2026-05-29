import request from '../request'

export const announcementApi = {
  list(params?: Record<string, unknown>) {
    return request.get('/system/announcements', { params })
  },
  create(data: Record<string, unknown>) {
    return request.post('/system/announcements', data)
  },
  update(id: number, data: Record<string, unknown>) {
    return request.put(`/system/announcements/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/system/announcements/${id}`)
  },
}
