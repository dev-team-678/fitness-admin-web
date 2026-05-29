import request from '../request'

export const checkinApi = {
  stats(params?: Record<string, unknown>) {
    return request.get('/checkin/stats', { params })
  },
  leaderboard(params?: Record<string, unknown>) {
    return request.get('/checkin/leaderboard', { params })
  },
}
