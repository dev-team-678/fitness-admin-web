import request from '../request'

export const bodyMetricApi = {
  list(params: Record<string, unknown>) {
    return request.get('/body-metrics', { params })
  },
  overview(params?: Record<string, unknown>) {
    return request.get('/body-metrics/overview', { params })
  },
  markAbnormal(id: number) {
    return request.put(`/body-metrics/${id}/abnormal`)
  },
  delete(id: number) {
    return request.delete(`/body-metrics/${id}`)
  },
}
