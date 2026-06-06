import request from '../request'

export interface MetricCard {
  title: string
  value: number
  change: number
  icon: string
  iconColor: string
}

export interface SeriesData {
  name: string
  value: number
}

export interface TrendData {
  date: string
  series: SeriesData[]
}

export interface PopularExercise {
  rank: number
  name: string
  category: string
  bodyPart: string
  count: number
  trend: number
}

export interface AiOverview {
  totalChatSessions: number
  chatSessionsChange: number
  totalPlanGenerated: number
  planGeneratedChange: number
  ragHitRate: number
  ragHitRateChange: number
  avgResponseTime: number
  avgResponseTimeChange: number
  safetyBlockCount: number
  safetyBlockChange: number
}

export interface DashboardOverview {
  metricCards: MetricCard[]
  userGrowthTrend: TrendData[]
  trainingActivityTrend: TrendData[]
  popularExercises: PopularExercise[]
  aiOverview: AiOverview
}

export const dashboardApi = {
  overview(days?: number) {
    return request.get('/dashboard/overview', {
      params: { days }
    })
  }
}
