<template>
  <div class="admin-layout">
    <Sidebar />
    <div class="main-container" :class="{ collapsed: appStore.sidebarCollapsed }">
      <Navbar />
      <TagsView />
      <div class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import TagsView from './components/TagsView.vue'

const appStore = useAppStore()
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.admin-layout {
  display: flex;
  height: 100%;
}

.main-container {
  flex: 1;
  margin-left: $sidebar-width;
  transition: margin-left 0.3s;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.collapsed {
    margin-left: $sidebar-collapsed-width;
  }
}

.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background-color: $bg-color;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
