import request from '../request'

export const operationLogApi = {
  list(params: Record<string, unknown>) {
    return request.get('/system/operation-logs', { params })
  },
}
