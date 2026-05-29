import type { Router } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { getToken } from '@/utils/auth'

const whiteList = ['/login', '/403', '/404']

export function setupRouterGuards(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    const userStore = useUserStore()
    const permStore = usePermissionStore()
    const hasToken = getToken()

    if (hasToken) {
      if (to.path === '/login') {
        next({ path: '/' })
        return
      }

      if (!permStore.routesGenerated) {
        try {
          await userStore.getUserInfo()
          const routes = permStore.generateRoutes(userStore.permissions)
          permStore.setPermissions(userStore.permissions)
          routes.forEach((r) => router.addRoute(r))
          next({ ...to, replace: true })
        } catch {
          userStore.logout()
          next(`/login?redirect=${to.path}`)
        }
        return
      }

      const perm = to.meta?.permission as string | undefined
      if (perm && !userStore.hasPermission(perm)) {
        next('/403')
        return
      }

      next()
    } else {
      if (whiteList.includes(to.path)) {
        next()
      } else {
        next(`/login?redirect=${to.path}`)
      }
    }
  })
}
