import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const tagsView = ref<string[]>([])

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function addTagView(path: string) {
    if (!tagsView.value.includes(path)) {
      tagsView.value.push(path)
    }
  }

  function removeTagView(path: string) {
    const index = tagsView.value.indexOf(path)
    if (index > -1) {
      tagsView.value.splice(index, 1)
    }
  }

  return { sidebarCollapsed, tagsView, toggleSidebar, addTagView, removeTagView }
})
