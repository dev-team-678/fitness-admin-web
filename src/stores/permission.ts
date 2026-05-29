import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { dynamicRoutes } from '@/router/dynamic-routes'

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])
  const menuRoutes = ref<RouteRecordRaw[]>([])
  const routesGenerated = ref(false)

  function generateRoutes(permissions: string[]): RouteRecordRaw[] {
    const filtered = filterRoutes(dynamicRoutes, permissions)
    routes.value = filtered
    menuRoutes.value = buildMenuRoutes(filtered)
    routesGenerated.value = true
    return filtered
  }

  function hasPermission(required: string | string[] | undefined): boolean {
    if (!required) return true
    const perms = Array.isArray(required) ? required : [required]
    return perms.some((p) => permissions.value.includes(p))
  }

  // Expose permissions for reactive checks
  const permissions = ref<string[]>([])

  function setPermissions(perms: string[]) {
    permissions.value = perms
  }

  return { routes, menuRoutes, routesGenerated, generateRoutes, hasPermission, setPermissions, permissions }
})

function filterRoutes(routes: RouteRecordRaw[], permissions: string[]): RouteRecordRaw[] {
  return routes
    .filter((route) => {
      const perm = route.meta?.permission as string | undefined
      if (!perm) return true
      return permissions.includes('*') || permissions.includes(perm)
    })
    .map((route) => ({
      ...route,
      children: route.children ? filterRoutes(route.children, permissions) : [],
    }))
}

function buildMenuRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  return routes.filter((r) => !r.meta?.hidden)
}

// Store permissions for hasPermission checks
let storePermissions: string[] = []

export function setStorePermissions(perms: string[]) {
  storePermissions = perms
}
