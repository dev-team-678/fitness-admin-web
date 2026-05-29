export type Permission = string

export function hasPermission(permissions: Permission[], required: Permission | Permission[]): boolean {
  if (!required) return true
  const requiredList = Array.isArray(required) ? required : [required]
  return requiredList.some((p) => permissions.includes(p))
}

export function hasAnyPermission(permissions: Permission[], required: Permission[]): boolean {
  return required.some((p) => permissions.includes(p))
}

export function hasAllPermissions(permissions: Permission[], required: Permission[]): boolean {
  return required.every((p) => permissions.includes(p))
}
