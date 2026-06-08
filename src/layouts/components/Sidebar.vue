<template>
  <div class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
    <!-- Logo 区域 -->
    <div class="sidebar-header">
      <div class="logo">
        <img src="@/assets/logo.png" alt="Logo" class="logo-img" />
        <transition name="fade-text">
          <div v-show="!appStore.sidebarCollapsed" class="logo-text">
            <h1>小程序健身助手</h1>
            <p>管理后台</p>
          </div>
        </transition>
      </div>
    </div>

    <!-- 菜单区域 -->
    <el-scrollbar class="menu-scrollbar">
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        :unique-opened="true"
        router
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <!-- ======================== 有子菜单 ======================== -->
          <template v-if="route.children && route.children.length > 0">

            <!-- 含三级嵌套的子菜单 -->
            <el-sub-menu v-if="hasNestedChildren(route)" :index="getFullPath(route.path)">
              <template #title>
                <svg-icon v-if="route.meta?.icon" :icon-class="(route.meta.icon as string)" class="menu-icon" />
                <span>{{ route.meta?.title }}</span>
              </template>
              <template v-for="child in route.children" :key="child.path">
                <!-- 三级子菜单 -->
                <el-sub-menu
                  v-if="child.children && child.children.length > 0"
                  :index="getFullPath(route.path, child.path)"
                >
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
                <!-- 普通二级菜单项 -->
                <el-menu-item v-else :index="getFullPath(route.path, child.path)">
                  {{ child.meta?.title }}
                </el-menu-item>
              </template>
            </el-sub-menu>

            <!-- 普通二级菜单（无三级嵌套） -->
            <el-sub-menu v-else :index="getFullPath(route.path)">
              <template #title>
                <svg-icon v-if="route.meta?.icon" :icon-class="(route.meta.icon as string)" class="menu-icon" />
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

          <!-- ======================== 无子菜单 ======================== -->
          <el-menu-item v-else :index="getFullPath(route.path)">
            <svg-icon v-if="route.meta?.icon" :icon-class="(route.meta.icon as string)" class="menu-icon" />
            <span>{{ route.meta?.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>

    <!-- 收起/展开按钮 -->
    <div class="collapse-btn" @click="appStore.toggleSidebar">
      <el-icon :size="18">
        <DArrowLeft v-if="!appStore.sidebarCollapsed" />
        <DArrowRight v-else />
      </el-icon>
      <span v-show="!appStore.sidebarCollapsed" class="collapse-text">收起菜单</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
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

/** 拼接完整路径（确保返回绝对路径） */
function getFullPath(...parts: string[]): string {
  return '/' + parts.join('/').replace(/\/+/g, '/').replace(/^\/+/, '')
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

/* ============================
   色彩变量（侧边栏专用）
   ============================ */
$sidebar-bg: #ffffff;
$sidebar-border: #e8ecf0;
$header-from: #43a047;
$header-to: #66bb6a;
$icon-color: #7cb342;
$icon-color-active: #ffffff;
$text-color: #37474f;
$text-color-light: #78909c;
$text-color-active: #ffffff;
$item-hover-bg: #f1f8e9;
$item-active-from: #43a047;
$item-active-to: #66bb6a;
$accent-orange: #ff8a65;
$sub-menu-bg: #f8faf5;
$collapse-btn-hover: #e8f5e9;

/* ============================
   侧边栏容器
   ============================ */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: $sidebar-width;
  background: $sidebar-bg;
  border-right: 1px solid $sidebar-border;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.collapsed {
    width: $sidebar-collapsed-width;
  }
}

/* ============================
   Logo 区域
   ============================ */
.sidebar-header {
  flex-shrink: 0;
}

.logo {
  height: $navbar-height;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: linear-gradient(135deg, $header-from 0%, $header-to 100%);
  overflow: hidden;
  gap: 10px;

  .logo-img {
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    border-radius: 6px;
  }

  .logo-text {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    white-space: nowrap;

    h1 {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      margin: 0;
      line-height: 1.4;
      letter-spacing: 1px;
    }

    p {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.75);
      margin: 0;
      line-height: 1.3;
    }
  }
}

.fade-text-enter-active,
.fade-text-leave-active {
  transition: opacity 0.2s ease;
}
.fade-text-enter-from,
.fade-text-leave-to {
  opacity: 0;
}

/* ============================
   菜单滚动区
   ============================ */
.menu-scrollbar {
  flex: 1;
  overflow: hidden;
}

/* ============================
   菜单图标 + 文字布局
   ============================ */
:deep(.menu-icon) {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: $icon-color;
  transition: color 0.25s;
  margin-right: 10px;
  vertical-align: middle;
}

.menu-label {
  font-size: 13.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ============================
   收起/展开按钮
   ============================ */
.collapse-btn {
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: $text-color-light;
  cursor: pointer;
  border-top: 1px solid $sidebar-border;
  transition: all 0.25s;
  flex-shrink: 0;
  user-select: none;

  &:hover {
    color: $header-from;
    background: $collapse-btn-hover;
  }

  .collapse-text {
    font-size: 13px;
    white-space: nowrap;
  }
}

/* ============================
   el-menu 全局覆盖
   ============================ */
:deep(.el-menu) {
  border-right: none;
  background-color: transparent;
}

/* ============================
   一级 SubMenu 标题
   ============================ */
:deep(.el-sub-menu__title) {
  height: 46px;
  line-height: 46px;
  color: $text-color;
  font-weight: 600;
  font-size: 13.5px;
  margin: 2px 10px;
  border-radius: 8px;
  padding-left: 16px !important;
  transition: all 0.25s;

  &:hover {
    background: $item-hover-bg;
  }

  .menu-icon {
    width: 20px;
    height: 20px;
    color: $icon-color;
  }
}

:deep(.el-sub-menu__icon-arrow) {
  font-size: 12px;
  color: #b0bec5;
  transition: transform 0.25s;
}

/* ============================
   二级菜单容器
   ============================ */
:deep(.el-sub-menu .el-menu) {
  background: $sub-menu-bg !important;
  padding: 2px 0;
}

/* ============================
   三级菜单容器
   ============================ */
:deep(.el-sub-menu .el-sub-menu .el-menu) {
  padding-left: 0;
  border-left: 2px solid #c8e6c9;
  margin-left: 20px;
}

:deep(.el-sub-menu .el-sub-menu .el-menu .el-menu-item) {
  padding-left: 24px !important;
  font-size: 12.5px;
}

/* ============================
   菜单项 (el-menu-item)
   ============================ */
:deep(.el-menu-item) {
  height: 40px;
  line-height: 40px;
  border-radius: 8px;
  margin: 2px 10px;
  padding-left: 16px !important;
  color: $text-color;
  font-size: 13px;
  transition: all 0.25s;

  .menu-icon {
    width: 18px;
    height: 18px;
    color: $icon-color;
  }

  &:hover {
    background: $item-hover-bg;
    color: darken($header-from, 8%);

    .menu-icon {
      color: $header-from;
    }
  }

  /* 选中状态 */
  &.is-active {
    background: linear-gradient(135deg, $item-active-from, $item-active-to);
    color: $text-color-active;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(67, 160, 71, 0.3);

    .menu-icon {
      color: $icon-color-active;
    }

    /* 左侧小圆点指示器 */
    &::before {
      content: '';
      position: absolute;
      left: 4px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 4px;
      background: $accent-orange;
      border-radius: 50%;
      box-shadow: 0 0 6px rgba($accent-orange, 0.6);
    }
  }
}

/* 二级菜单项选中态（更柔和） */
:deep(.el-sub-menu .el-menu .el-menu-item) {
  margin: 1px 8px;

  &.is-active {
    background: linear-gradient(135deg, rgba($item-active-from, 0.7), rgba($item-active-to, 0.7));
    box-shadow: 0 1px 4px rgba(67, 160, 71, 0.2);
  }
}

/* SubMenu 自身选中态 */
:deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: $header-from;

  .menu-icon {
    color: $header-from;
  }
}

/* ============================
   收起状态样式
   ============================ */
.sidebar.collapsed {
  /* Logo 居中 */
  .logo {
    justify-content: center;
    padding: 0;
  }

  /* SubMenu 标题居中、只显示图标 */
  :deep(.el-sub-menu__title) {
    padding: 0 !important;
    justify-content: center;
    margin: 2px 8px;

    .menu-icon {
      margin-right: 0;
      width: 22px;
      height: 22px;
    }

    .menu-label {
      display: none;
    }
  }

  /* 独立菜单项居中、只显示图标 */
  :deep(.el-menu-item) {
    padding: 0 !important;
    justify-content: center;
    margin: 2px 8px;

    .menu-icon {
      margin-right: 0;
      width: 22px;
      height: 22px;
    }

    .menu-label {
      display: none;
    }

    &.is-active::before {
      display: none;
    }
  }

  /* 隐藏展开箭头 */
  :deep(.el-sub-menu__icon-arrow) {
    display: none !important;
  }
}

/* ============================
   收起时弹出子菜单样式
   ============================ */
:deep(.el-menu--collapse) {
  .el-sub-menu__title {
    padding: 0 !important;
  }
}

:deep(.el-menu--popup) {
  min-width: 170px;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  background: #fff;
  padding: 6px 0;

  .el-sub-menu {
    margin: 0 6px;
    border-radius: 6px;
  }

  .el-sub-menu__title {
    padding-left: 14px !important;
    margin: 0;
    border-radius: 6px;
    height: 38px;
    line-height: 38px;
    font-size: 13px;
  }

  .el-menu-item {
    padding-left: 14px !important;
    margin: 1px 6px;
    border-radius: 6px;
    height: 36px;
    line-height: 36px;
    font-size: 13px;

    &:hover {
      background: $item-hover-bg;
    }

    &.is-active {
      background: linear-gradient(135deg, $item-active-from, $item-active-to);
      color: #fff;

      &::before {
        left: 4px;
      }
    }
  }

  /* 弹出菜单中的三级子菜单 */
  .el-sub-menu .el-menu {
    background: transparent !important;
  }

  .el-sub-menu .el-sub-menu .el-menu {
    border-left: none;
    margin-left: 8px;
  }
}
</style>
