import request from '../request'

export const aiAnalyticsApi = {
  overview(params?: Record<string, unknown>) {
    return request.get('/ai/analytics/overview', { params })
  },
  chatTrend(params?: Record<string, unknown>) {
    return request.get('/ai/analytics/chat-trend', { params })
  },
  satisfactionTrend(params?: Record<string, unknown>) {
    return request.get('/ai/analytics/satisfaction-trend', { params })
  },
  knowledgeUsage(params?: Record<string, unknown>) {
    return request.get('/ai/analytics/knowledge-usage', { params })
  },
  hotQuestions(params?: Record<string, unknown>) {
    return request.get('/ai/analytics/hot-questions', { params })
  },
  planStats(params?: Record<string, unknown>) {
    return request.get('/ai/analytics/plan-stats', { params })
  },
  tokenUsage(params?: Record<string, unknown>) {
    return request.get('/ai/analytics/token-usage', { params })
  },
  ragHitRate(params?: Record<string, unknown>) {
    return request.get('/ai/analytics/rag-hit-rate', { params })
  },
  responseTime(params?: Record<string, unknown>) {
    return request.get('/ai/analytics/response-time', { params })
  },
  issues(params?: Record<string, unknown>) {
    return request.get('/ai/analytics/issues', { params })
  },
}
