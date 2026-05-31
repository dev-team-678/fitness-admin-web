import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@/api/auth'
import { setToken, removeToken } from '@/utils/auth'
import { usePermissionStore } from '@/stores/permission'

export interface AdminUser {
  id: number
  userId: number
  username: string
  nickname: string
  avatar: string
  roleId: number | null
  roleName: string
  status: number
  lastLoginAt: string | null
  lastLoginIp: string | null
  permissions: string[]
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const userInfo = ref<AdminUser | null>(null)
  const permissions = ref<string[]>([])

  async function login(username: string, password: string) {
    const res = await authApi.login({ username, password })
    const data = res.data
    token.value = data.token
    setToken(data.token)
    return data
  }

  async function getUserInfo() {
    const res = await authApi.profile()
    const data = res.data
    userInfo.value = data
    permissions.value = data.permissions || []
    return data
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    permissions.value = []
    removeToken()
    // 重置权限 store，确保重新登录后会重新生成路由
    const permStore = usePermissionStore()
    permStore.routesGenerated = false
  }

  function hasPermission(perm: string): boolean {
    if (permissions.value.includes('*')) return true
    return permissions.value.includes(perm)
  }

  return { token, userInfo, permissions, login, getUserInfo, logout, hasPermission }
})
