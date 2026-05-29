<template>
  <div class="tags-view">
    <el-scrollbar class="tags-scrollbar">
      <div class="tags-wrapper">
        <router-link
          v-for="tag in visitedViews"
          :key="tag.path"
          :to="tag.path"
          :class="['tag-item', { active: isActive(tag) }]"
        >
          {{ tag.title }}
          <el-icon v-if="!isAffix(tag)" class="tag-close" @click.prevent.stop="closeTag(tag)">
            <Close />
          </el-icon>
        </router-link>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface TagView {
  path: string
  title: string
  affix?: boolean
}

const route = useRoute()
const router = useRouter()
const visitedViews = ref<TagView[]>([])

function isActive(tag: TagView): boolean {
  return tag.path === route.path
}

function isAffix(tag: TagView): boolean {
  return tag.affix === true
}

function addView() {
  const { path, meta } = route
  if (meta?.hidden) return
  if (!visitedViews.value.find((v) => v.path === path)) {
    visitedViews.value.push({
      path,
      title: (meta?.title as string) || '未命名',
      affix: path === '/dashboard',
    })
  }
}

function closeTag(tag: TagView) {
  const index = visitedViews.value.findIndex((v) => v.path === tag.path)
  if (index === -1) return
  visitedViews.value.splice(index, 1)
  if (isActive(tag)) {
    const last = visitedViews.value[visitedViews.value.length - 1]
    router.push(last?.path || '/dashboard')
  }
}

watch(() => route.path, addView, { immediate: true })
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.tags-view {
  height: $tagsview-height;
  background: $bg-white;
  border-bottom: 1px solid $border-light;
  display: flex;
  align-items: center;
}

.tags-scrollbar {
  flex: 1;
}

.tags-wrapper {
  display: flex;
  align-items: center;
  padding: 0 8px;
  gap: 4px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 12px;
  color: $text-regular;
  background: $bg-color;
  border: 1px solid $border-light;
  border-radius: 3px;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: $primary-color;
  }

  &.active {
    color: #fff;
    background-color: $primary-color;
    border-color: $primary-color;
  }
}

.tag-close {
  font-size: 12px;
  border-radius: 50%;

  &:hover {
    background-color: rgba(0, 0, 0, 0.15);
  }
}
</style>
