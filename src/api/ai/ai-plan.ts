import request from '../request'

export const aiPlanApi = {
  list(params: Record<string, unknown>) {
    return request.get('/ai/plans', { params })
  },
  detail(id: number) {
    return request.get(`/ai/plans/${id}`)
  },
  adjustments(id: number) {
    return request.get(`/ai/plans/${id}/adjustments`)
  },
  updateStatus(id: number, data: { status: string }) {
    return request.put(`/ai/plans/${id}/status`, data)
  },
  convertToSystem(id: number) {
    return request.post(`/ai/plans/${id}/convert-to-system`)
  },
  stats(params?: Record<string, unknown>) {
    return request.get('/ai/plans/stats', { params })
  },
  getAdjustmentRules() {
    return request.get('/ai/adjustment-rules')
  },
  updateAdjustmentRules(data: Record<string, unknown>) {
    return request.put('/ai/adjustment-rules', data)
  },
}
