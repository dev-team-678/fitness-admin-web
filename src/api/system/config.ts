import request from '../request'

export const systemConfigApi = {
  list() {
    return request.get('/sys-config/list')
  },
  update(key: string, data: { value: string }) {
    return request.put(`/sys-config/${key}`, data)
  },
  save(data: Record<string, unknown>) {
    return request.post('/sys-config', data)
  },
  delete(id: number) {
    return request.delete(`/sys-config/${id}`)
  },
  getAiConfig() {
    return request.get('/sys-config/ai-config')
  },
  updateAiConfig(data: Record<string, unknown>) {
    return request.put('/sys-config/ai-config', data)
  },
  testAiConnection() {
    return request.post('/sys-config/ai-config/test-connection')
  },
}
