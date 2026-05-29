import request from '../request'

export const roleApi = {
  list() {
    return request.get('/roles')
  },
  create(data: { name: string; permissions: string[] }) {
    return request.post('/roles', data)
  },
  update(id: number, data: { name: string; permissions: string[] }) {
    return request.put(`/roles/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/roles/${id}`)
  },
}
