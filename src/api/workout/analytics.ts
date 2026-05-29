import request from '../request'

export const workoutAnalyticsApi = {
  overview(params?: Record<string, unknown>) {
    return request.get('/analytics/workout-overview', { params })
  },
  trend(params?: Record<string, unknown>) {
    return request.get('/analytics/workout-trend', { params })
  },
  peakHours(params?: Record<string, unknown>) {
    return request.get('/analytics/peak-hours', { params })
  },
  exercisePopularity(params?: Record<string, unknown>) {
    return request.get('/analytics/exercise-popularity', { params })
  },
  planFunnel(params?: Record<string, unknown>) {
    return request.get('/analytics/plan-funnel', { params })
  },
  records(params: Record<string, unknown>) {
    return request.get('/workout-records', { params })
  },
  exportRecords(params?: Record<string, unknown>) {
    return request.get('/workout-records/export', { params, responseType: 'blob' })
  },
}
