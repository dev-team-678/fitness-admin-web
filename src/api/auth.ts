import request from './request'

export const authApi = {
  login(data: { username: string; password: string }) {
    return request.post('/auth/login', data)
  },
  logout() {
    return request.post('/auth/logout')
  },
  refresh() {
    return request.post('/auth/refresh')
  },
  profile() {
    return request.get('/auth/profile')
  },
  updatePassword(data: { oldPassword: string; newPassword: string }) {
    return request.put('/auth/password', data)
  },
}
