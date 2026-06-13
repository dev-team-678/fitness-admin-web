import request from '../request'

export const workoutAnalyticsApi = {
  overview(params?: Record<string, unknown>) {
    return request.get('/workout-record/overview', { params })
  },
  trend(params?: Record<string, unknown>) {
    return request.get('/workout-record/trend', { params })
  },
  peakHours(params?: Record<string, unknown>) {
    return request.get('/workout-record/peak-hours', { params })
  },
  exercisePopularity(params?: Record<string, unknown>) {
    return request.get('/workout-record/exercise-popularity', { params })
  },
  planFunnel(params?: Record<string, unknown>) {
    return request.get('/workout-record/plan-funnel', { params })
  },
  records(params: Record<string, unknown>) {
    return request.get('/workout-record/list', { params })
  },
  exportRecords(params?: Record<string, unknown>) {
    return request.get<Blob>('/workout-record/export', {
      params,
      responseType: 'blob',
    } as Record<string, unknown>)
  },
}
