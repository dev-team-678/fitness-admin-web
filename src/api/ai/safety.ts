import request from '../request'

export const safetyApi = {
  rules(params?: Record<string, unknown>) {
    return request.get('/ai/safety-rules', { params })
  },
  createRule(data: Record<string, unknown>) {
    return request.post('/ai/safety-rules', data)
  },
  ruleDetail(id: number) {
    return request.get(`/ai/safety-rules/${id}`)
  },
  updateRule(id: number, data: Record<string, unknown>) {
    return request.put(`/ai/safety-rules/${id}`, data)
  },
  deleteRule(id: number) {
    return request.delete(`/ai/safety-rules/${id}`)
  },
  testRule(data: { text: string }) {
    return request.post('/ai/safety-rules/test', data)
  },
  events(params?: Record<string, unknown>) {
    return request.get('/ai/safety-events', { params })
  },
}
