export function isValidUsername(value: string): boolean {
  return /^[a-zA-Z0-9_]{4,32}$/.test(value)
}

export function isValidPassword(value: string): boolean {
  return value.length >= 8 && value.length <= 64
}

export function isValidPhone(value: string): boolean {
  return /^1[3-9]\d{9}$/.test(value)
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isValidUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export function isValidRegex(pattern: string): boolean {
  try {
    new RegExp(pattern)
    return true
  } catch {
    return false
  }
}

// Required field rule
export const requiredRule = (message: string) => ({
  required: true,
  message,
  trigger: 'blur',
})

// Length range rule
export const lengthRule = (min: number, max: number, message: string) => ({
  min,
  max,
  message,
  trigger: 'blur',
})
