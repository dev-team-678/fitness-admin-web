import request from '../request'

export const postApi = {
  list(params: Record<string, unknown>) {
    return request.get('/community-post/list', { params })
  },
  updateStatus(id: number, data: { status: number }) {
    return request.put(`/community-post/${id}/status`, data)
  },
  togglePin(id: number, data: { pinned: boolean }) {
    return request.put(`/community-post/${id}/pin`, data)
  },
}
