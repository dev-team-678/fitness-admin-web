<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :href="iconName" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  iconClass: string
  className?: string
}>()

const iconName = computed(() => `#icon-${props.iconClass}`)

const svgClass = computed(() => {
  const base = 'svg-icon'
  return props.className ? `${base} ${props.className}` : base
})
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
  flex-shrink: 0;
}
</style>
