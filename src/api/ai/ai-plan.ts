import request from '../request'

export const aiPlanApi = {
  list(params: Record<string, unknown>) {
    return request.get('/ai-plan/list', { params })
  },
  detail(id: number) {
    return request.get(`/ai-plan/${id}`)
  },
  adjustments(id: number) {
    return request.get(`/ai-plan/${id}/adjustments`)
  },
  updateStatus(id: number, data: { status: string }) {
    return request.put(`/ai-plan/${id}/status`, data)
  },
  convertToSystem(id: number) {
    return request.post(`/ai-plan/${id}/convert-to-system`)
  },
  stats(params?: Record<string, unknown>) {
    return request.get('/ai-plan/stats', { params })
  },
  getAdjustmentRules() {
    return request.get('/ai-plan/adjustment-rules')
  },
  updateAdjustmentRules(data: Record<string, unknown>) {
    return request.put('/ai-plan/adjustment-rules', data)
  },
}
