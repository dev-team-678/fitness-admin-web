import axios, { type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from '@/utils/auth'
import router from '@/router'
import JSONBig from 'json-bigint'
import type { ApiResponse } from '@/types/api'

const baseURL = import.meta.env.VITE_APP_BASE_API || '/api/v1'

const jsonBig = JSONBig({ storeAsString: true })

const service = axios.create({
  baseURL,
  timeout: 30000,
  transformResponse: [
    (data) => {
      try {
        return jsonBig.parse(data)
      } catch {
        return data
      }
    },
  ],
})

// Request interceptor: inject JWT
service.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: unified error handling
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    const { code, message } = response.data
    if (code !== 0 && code !== 200) {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message))
    }
    // 返回完整的 ApiResponse，调用方通过 res.data 获取业务数据
    return response.data
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
