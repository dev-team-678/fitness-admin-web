import request from '../request'

export const commentApi = {
  list(params: Record<string, unknown>) {
    return request.get('/community/comments', { params })
  },
  delete(id: number) {
    return request.delete(`/community/comments/${id}`)
  },
}
