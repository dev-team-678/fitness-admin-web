import request from '../request'

export const systemConfigApi = {
  list() {
    return request.get('/system/configs')
  },
  update(key: string, data: { value: string }) {
    return request.put(`/system/configs/${key}`, data)
  },
  getAiConfig() {
    return request.get('/system/ai-config')
  },
  updateAiConfig(data: Record<string, unknown>) {
    return request.put('/system/ai-config', data)
  },
  testAiConnection() {
    return request.post('/system/ai-config/test-connection')
  },
}
