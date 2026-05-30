<template>
  <div class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
    <div class="logo">
      <img src="@/assets/vue.svg" alt="Logo" class="logo-img" />
      <span v-show="!appStore.sidebarCollapsed" class="logo-text">健身助手管理后台</span>
    </div>
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        :unique-opened="true"
        background-color="#001529"
        text-color="#ffffffb3"
        active-text-color="#ffffff"
        router
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <!-- 有子路由的情况 -->
          <template v-if="route.children && route.children.length > 0">
            <!-- 检查子路由是否还有子路由（3级菜单） -->
            <el-sub-menu v-if="hasNestedChildren(route)" :index="route.path">
              <template #title>
                <el-icon v-if="route.meta?.icon">
                  <component :is="route.meta.icon" />
                </el-icon>
                <span>{{ route.meta?.title }}</span>
              </template>
              <template v-for="child in route.children" :key="child.path">
                <!-- 子路由还有子路由 -->
                <el-sub-menu v-if="child.children && child.children.length > 0" :index="getFullPath(route.path, child.path)">
                  <template #title>
                    <span>{{ child.meta?.title }}</span>
                  </template>
                  <el-menu-item
                    v-for="grandchild in child.children"
                    :key="grandchild.path"
                    :index="getFullPath(route.path, child.path, grandchild.path)"
                  >
                    {{ grandchild.meta?.title }}
                  </el-menu-item>
                </el-sub-menu>
                <!-- 子路由没有子路由（2级菜单项） -->
                <el-menu-item v-else :index="getFullPath(route.path, child.path)">
                  {{ child.meta?.title }}
                </el-menu-item>
              </template>
            </el-sub-menu>
            <!-- 普通2级菜单 -->
            <el-sub-menu v-else :index="route.path">
              <template #title>
                <el-icon v-if="route.meta?.icon">
                  <component :is="route.meta.icon" />
                </el-icon>
                <span>{{ route.meta?.title }}</span>
              </template>
              <el-menu-item
                v-for="child in route.children"
                :key="child.path"
                :index="getFullPath(route.path, child.path)"
              >
                {{ child.meta?.title }}
              </el-menu-item>
            </el-sub-menu>
          </template>
          <!-- 没有子路由的情况 -->
          <el-menu-item v-else :index="route.path">
            <el-icon v-if="route.meta?.icon">
              <component :is="route.meta.icon" />
            </el-icon>
            <span>{{ route.meta?.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'

const route = useRoute()
const appStore = useAppStore()
const permStore = usePermissionStore()

const activeMenu = computed(() => route.path)
const menuRoutes = computed(() => permStore.menuRoutes)

/** 判断路由是否有嵌套的子路由（3级菜单） */
function hasNestedChildren(route: RouteRecordRaw): boolean {
  return route.children?.some((child) => child.children && child.children.length > 0) ?? false
}

/** 拼接完整路径 */
function getFullPath(...parts: string[]): string {
  return parts.join('/').replace(/\/+/g, '/')
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: $sidebar-width;
  background-color: #001529;
  transition: width 0.3s;
  z-index: 1001;
  display: flex;
  flex-direction: column;

  &.collapsed {
    width: $sidebar-collapsed-width;
  }
}

.logo {
  height: $navbar-height;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background-color: #002140;

  .logo-img {
    width: 28px;
    height: 28px;
  }

  .logo-text {
    margin-left: 8px;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
  }
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-sub-menu .el-menu) {
  background-color: #000c17 !important;
}

:deep(.el-sub-menu .el-sub-menu .el-menu) {
  background-color: #000810 !important;
}

:deep(.el-menu-item.is-active) {
  background-color: $primary-color !important;
}
</style>
