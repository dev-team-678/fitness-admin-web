import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

export const vPermission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const userStore = useUserStore()
    const required = binding.value

    if (!required) return

    const requiredList = Array.isArray(required) ? required : [required]
    const hasPerm = requiredList.some((p) => userStore.hasPermission(p))

    if (!hasPerm) {
      el.parentNode?.removeChild(el)
    }
  },
}
