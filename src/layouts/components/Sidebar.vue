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
        background-color="#001529"
        text-color="#ffffffb3"
        active-text-color="#ffffff"
        router
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <template v-if="route.children && route.children.length > 0">
            <el-sub-menu :index="route.path">
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
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'

const route = useRoute()
const appStore = useAppStore()
const permStore = usePermissionStore()

const activeMenu = computed(() => route.path)
const menuRoutes = computed(() => permStore.menuRoutes)

function getFullPath(parent: string, child: string): string {
  return `${parent}/${child}`.replace(/\/+/g, '/')
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

:deep(.el-menu-item.is-active) {
  background-color: $primary-color !important;
}
</style>
