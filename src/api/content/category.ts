import request from '../request'

export const categoryApi = {
  list() {
    return request.get('/categories')
  },
  create(data: { name: string; parentId?: number }) {
    return request.post('/categories', data)
  },
  update(id: number, data: { name: string }) {
    return request.put(`/categories/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/categories/${id}`)
  },
}
