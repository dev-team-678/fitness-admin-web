import request from '../request'

export const categoryApi = {
  list() {
    return request.get('/category/list')
  },
  create(data: { name: string; parentId?: number }) {
    return request.post('/category', data)
  },
  update(id: number, data: { name: string; sortOrder?: number }) {
    return request.put(`/category/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/category/${id}`)
  },
}
