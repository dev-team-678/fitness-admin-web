import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from '@/utils/auth'
import router from '@/router'

const baseURL = import.meta.env.VITE_APP_BASE_API || '/api/admin/v1'

const service = axios.create({
  baseURL,
  timeout: 30000,
})

// Request interceptor: inject JWT
service.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      // Sa-Token 不需要 Bearer 前缀
      config.headers.Authorization = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: unified error handling
service.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data
    if (code !== 0 && code !== 200) {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message))
    }
    return response.data as any
  },
  (error) => {
    if (error.response?.status === 401) {
      removeToken()
      router.push('/login')
      ElMessage.error('登录已过期，请重新登录')
    } else {
      ElMessage.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default service
