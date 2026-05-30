import request from '../request'

export const aiAnalyticsApi = {
  overview(params?: Record<string, unknown>) {
    return request.get('/ai-plan/analytics/overview', { params })
  },
  chatTrend(params?: Record<string, unknown>) {
    return request.get('/ai-chat/analytics/chat-trend', { params })
  },
  satisfactionTrend(params?: Record<string, unknown>) {
    return request.get('/ai-chat/analytics/satisfaction-trend', { params })
  },
  knowledgeUsage(params?: Record<string, unknown>) {
    return request.get('/ai-knowledge/analytics/usage', { params })
  },
  hotQuestions(params?: Record<string, unknown>) {
    return request.get('/ai-chat/analytics/hot-questions', { params })
  },
  planStats(params?: Record<string, unknown>) {
    return request.get('/ai-plan/analytics/plan-stats', { params })
  },
  tokenUsage(params?: Record<string, unknown>) {
    return request.get('/ai-plan/analytics/token-usage', { params })
  },
  ragHitRate(params?: Record<string, unknown>) {
    return request.get('/ai-knowledge/analytics/rag-hit-rate', { params })
  },
  responseTime(params?: Record<string, unknown>) {
    return request.get('/ai-chat/analytics/response-time', { params })
  },
}
