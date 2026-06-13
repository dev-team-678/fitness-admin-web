/**
 * 全局 API 响应与分页结构。
 *
 * 与后端 `R<T>` 保持一致:
 *   { code: number; message: string; data: T; timestamp: number }
 *
 * 后端 code 业务约定:
 *   200 / 0    成功
 *   401        未登录
 *   4031       无权限
 *   5001-5005  AI 服务相关
 *   9001       限流
 *   9999       系统异常
 */

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp?: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
}

export interface PageQuery {
  pageNum?: number
  pageSize?: number
  keyword?: string
  [key: string]: unknown
}

export const isSuccess = <T>(resp: ApiResponse<T>): boolean =>
  resp.code === 0 || resp.code === 200
