import request from '../request'

export const bodyMetricApi = {
  list(params: Record<string, unknown>) {
    return request.get('/body-metric/list', { params })
  },
  overview(params?: Record<string, unknown>) {
    return request.get('/body-metric/overview', { params })
  },
  save(data: Record<string, unknown>) {
    return request.post('/body-metric', data)
  },
  markAbnormal(id: number) {
    return request.put(`/body-metric/${id}/abnormal`)
  },
  delete(id: number) {
    return request.delete(`/body-metric/${id}`)
  },
}
