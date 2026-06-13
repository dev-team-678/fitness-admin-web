import axios, { type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from '@/utils/auth'
import router from '@/router'
import JSONBig from 'json-bigint'
import type { ApiResponse } from '@/types/api'

const baseURL = import.meta.env.VITE_APP_BASE_API || '/api/v1'

const jsonBig = JSONBig({ storeAsString: true })

// 业务 HTTP 客户端:所有方法均返回 ApiResponse<T>,由调用方直接读取 res.data
class HttpClient {
  private instance = axios.create({
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

  constructor() {
    this.instance.interceptors.request.use(
      (config) => {
        const token = getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<unknown>>) => {
        const { code, message } = response.data
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
  }

  get<T = any>(url: string, config?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.instance.get(url, config) as any
  }

  post<T = any>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.instance.post(url, data, config) as any
  }

  put<T = any>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.instance.put(url, data, config) as any
  }

  delete<T = any>(url: string, config?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.instance.delete(url, config) as any
  }
}

const service = new HttpClient()

export default service
