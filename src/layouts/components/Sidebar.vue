<template>
  <div class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
    <div class="sidebar-header">
      <div class="logo">
        <img src="@/assets/logo.png" alt="Logo" class="logo-img" />
        <div v-show="!appStore.sidebarCollapsed" class="logo-content">
          <h1 class="logo-title">健身助手管理后台</h1>
          <p class="logo-subtitle">Fitness Admin Backend</p>
        </div>
      </div>
    </div>
    <el-scrollbar class="menu-scrollbar">
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        :unique-opened="true"
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
    <div class="collapse-btn" @click="appStore.toggleSidebar">
      <el-icon>
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>
      <span v-show="!appStore.sidebarCollapsed" class="collapse-text">收起菜单</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { Fold, Expand } from '@element-plus/icons-vue'
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

// 自定义绿色渐变配色
$green-start: #81c784;
$green-end: #66bb6a;
$orange-light: #ffcc80;
$orange-accent: #ff7043;
$bg-gradient-start: #f1f8e9;
$bg-gradient-end: #fff8e1;

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: $sidebar-width;
  background: linear-gradient(180deg, $bg-gradient-start 0%, $bg-gradient-end 100%);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
  border-right: 1px solid #c8e6c9;
  transition: width 0.3s;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.collapsed {
    width: $sidebar-collapsed-width;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, $green-start, $green-end, $orange-light, $orange-accent);
    z-index: 1;
  }
}

.sidebar-header {
  position: relative;
  z-index: 2;
}

.logo {
  height: $navbar-height;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background: linear-gradient(135deg, $green-start 0%, $green-end 100%);
  box-shadow: 0 2px 8px rgba(102, 187, 106, 0.3);

  .logo-img {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .logo-content {
    margin-left: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
  }

  .logo-title {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
    line-height: 1.3;
    white-space: nowrap;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .logo-subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
    line-height: 1.3;
  }
}

.menu-scrollbar {
  flex: 1;
  overflow: hidden;
}

.collapse-btn {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #558b2f;
  cursor: pointer;
  border-top: 1px solid #c8e6c9;
  transition: all 0.3s;
  background: linear-gradient(135deg, rgba($green-start, 0.3) 0%, rgba($green-end, 0.2) 100%);
  flex-shrink: 0;

  &:hover {
    color: #ffffff;
    background: linear-gradient(135deg, $green-start 0%, $green-end 100%);
  }

  .el-icon {
    font-size: 18px;
  }

  .collapse-text {
    font-size: 14px;
    white-space: nowrap;
  }
}

:deep(.el-menu) {
  border-right: none;
  background-color: transparent;
}

:deep(.el-sub-menu) {
  margin: 4px 8px;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(129, 199, 132, 0.15);
    transform: translateX(2px);
  }

  // 收起状态下的一级菜单样式
  &.is-active > .el-sub-menu__title {
    background: linear-gradient(135deg, $green-start 0%, $green-end 100%);
    color: #ffffff;
    box-shadow: 0 3px 10px rgba(102, 187, 106, 0.4);

    .el-icon {
      color: #ffffff;
    }
  }
}

:deep(.el-sub-menu__title) {
  height: 46px;
  line-height: 46px;
  border-radius: 10px;
  color: #33691e;
  font-weight: 700;
  margin: 0;
  padding-left: 20px !important;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(129, 199, 132, 0.2);
    color: #1b5e20;
  }

  .el-icon {
    font-size: 22px;
    margin-right: 10px;
    color: $green-end;
  }
}

:deep(.el-sub-menu .el-menu) {
  background-color: rgba(255, 255, 255, 0.6) !important;
  padding-left: 0;
  padding-right: 8px;
  backdrop-filter: blur(10px);
}

:deep(.el-sub-menu .el-sub-menu .el-menu) {
  padding-left: 0;
  border-left: 3px solid $orange-light;
  margin-left: 16px;
}

:deep(.el-menu-item) {
  height: 42px;
  line-height: 42px;
  border-radius: 8px;
  margin: 2px 8px 2px 8px;
  padding-left: 20px !important;
  color: #558b2f;
  font-size: 13px;
  transition: all 0.3s ease;

  .el-icon {
    font-size: 20px;
    margin-right: 10px;
    color: $green-end;
  }

  &:hover {
    background-color: rgba(255, 204, 128, 0.3);
    color: #33691e;
    transform: translateX(0);
  }

  &.is-active {
    background: linear-gradient(135deg, $green-start 0%, $green-end 100%);
    color: #ffffff;
    font-weight: 600;
    position: relative;
    box-shadow: 0 3px 10px rgba(102, 187, 106, 0.4);

    .el-icon {
      color: #ffffff;
    }

    &::before {
      content: '';
      position: absolute;
      left: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 6px;
      height: 6px;
      background: $orange-light;
      border-radius: 50%;
      box-shadow: 0 0 6px $orange-accent;
    }
  }
}

// 二级菜单项选中样式（背景更浅）
:deep(.el-sub-menu .el-menu .el-menu-item) {
  &.is-active {
    background: linear-gradient(135deg, rgba($green-start, 0.6) 0%, rgba($green-end, 0.6) 100%);
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(102, 187, 106, 0.25);

    &::before {
      background: rgba($orange-light, 0.8);
      box-shadow: 0 0 4px rgba($orange-accent, 0.6);
    }
  }
}

:deep(.el-sub-menu__icon-arrow) {
  font-size: 12px;
  color: #81c784;
  transition: transform 0.3s;
}

// ==================== 收起状态样式 ====================
.sidebar.collapsed {
  :deep(.el-sub-menu) {
    margin: 4px 8px;
    border-radius: 8px;
    overflow: visible;

    &:hover {
      transform: none;
      background-color: rgba(129, 199, 132, 0.15);
    }
  }

  :deep(.el-sub-menu__title) {
    padding: 0 !important;
    justify-content: center;

    .el-icon {
      margin: 0 !important;
      font-size: 20px;
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: $green-end;
    }
  }

  :deep(.el-menu-item) {
    margin: 4px 8px;
    padding: 0 !important;
    justify-content: center;

    .el-icon {
      margin: 0 !important;
      font-size: 20px;
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: $green-end;
    }

    &.is-active::before {
      display: none;
    }
  }

  // 收起时隐藏箭头
  :deep(.el-sub-menu__icon-arrow) {
    display: none !important;
  }
}

// 收起状态下的弹出子菜单样式
:deep(.el-menu--collapse) {
  .el-sub-menu__title {
    padding: 0 !important;
  }
}

:deep(.el-menu--popup) {
  min-width: 180px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  background: linear-gradient(180deg, $bg-gradient-start 0%, $bg-gradient-end 100%);

  .el-sub-menu {
    margin: 2px 4px;
    border-radius: 6px;

    &:hover {
      transform: none;
    }
  }

  .el-sub-menu__title {
    padding-left: 16px !important;
  }

  .el-menu-item {
    padding-left: 16px !important;
    margin: 2px 4px;
    border-radius: 6px;

    &:hover {
      background-color: rgba(129, 199, 132, 0.15);
    }

    &.is-active {
      background: linear-gradient(135deg, $green-start 0%, $green-end 100%);
      color: #ffffff;
    }

    &.is-active::before {
      left: 4px;
    }
  }
}
</style>
