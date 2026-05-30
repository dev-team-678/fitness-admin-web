import request from '../request'

export const announcementApi = {
  list(params?: Record<string, unknown>) {
    return request.get('/announcement/list', { params })
  },
  create(data: Record<string, unknown>) {
    return request.post('/announcement', data)
  },
  update(id: number, data: Record<string, unknown>) {
    return request.put(`/announcement/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/announcement/${id}`)
  },
}
