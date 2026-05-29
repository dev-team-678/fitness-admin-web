/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'md-editor-v3' {
  import type { DefineComponent } from 'vue'
  export const MdEditor: DefineComponent<object, object, unknown>
  export const MdPreview: DefineComponent<object, object, unknown>
}
