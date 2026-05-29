import dayjs from 'dayjs'

export function formatDate(date: string | Date, format = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format)
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
}

export function formatWeight(kg: number): string {
  if (kg >= 1000) {
    return (kg / 1000).toFixed(1) + '吨'
  }
  return kg.toLocaleString() + 'kg'
}

export function formatPercent(value: number, decimals = 1): string {
  return (value * 100).toFixed(decimals) + '%'
}
