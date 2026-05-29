import request from '../request'

export const bodyPartApi = {
  list() {
    return request.get('/body-parts')
  },
  create(data: { name: string }) {
    return request.post('/body-parts', data)
  },
  update(id: number, data: { name: string }) {
    return request.put(`/body-parts/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/body-parts/${id}`)
  },
}
