import request from '../request'

export const chatMonitorApi = {
  sessions(params: Record<string, unknown>) {
    return request.get('/ai/chat-sessions', { params })
  },
  sessionDetail(id: number) {
    return request.get(`/ai/chat-sessions/${id}`)
  },
  messages(id: number, params?: Record<string, unknown>) {
    return request.get(`/ai/chat-sessions/${id}/messages`, { params })
  },
  markIssue(sessionId: number, msgId: number, data: { reason: string }) {
    return request.post(`/ai/chat-sessions/${sessionId}/messages/${msgId}/issue`, data)
  },
  updateIssue(sessionId: number, msgId: number, data: { correction: string }) {
    return request.put(`/ai/chat-sessions/${sessionId}/messages/${msgId}/issue`, data)
  },
  toKnowledge(sessionId: number, msgId: number) {
    return request.post(`/ai/chat-sessions/${sessionId}/messages/${msgId}/to-knowledge`)
  },
  feedbackStats(params?: Record<string, unknown>) {
    return request.get('/ai/chat-feedback-stats', { params })
  },
  issues(params?: Record<string, unknown>) {
    return request.get('/ai/chat-issues', { params })
  },
  handleIssue(id: number, data: Record<string, unknown>) {
    return request.put(`/ai/chat-issues/${id}`, data)
  },
}
