import request from '../request'

export const commentApi = {
  list(params: Record<string, unknown>) {
    return request.get('/community-comment/list', { params })
  },
  updateStatus(id: number, data: { status: number }) {
    return request.put(`/community-comment/${id}/status`, data)
  },
  delete(id: number) {
    return request.delete(`/community-comment/${id}`)
  },
}
