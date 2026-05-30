import request from '../request'

export const bodyPartApi = {
  list() {
    return request.get('/body-part/list')
  },
  create(data: { name: string }) {
    return request.post('/body-part', data)
  },
  update(id: number, data: { name: string }) {
    return request.put(`/body-part/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/body-part/${id}`)
  },
}
