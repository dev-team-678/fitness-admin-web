<template>
  <div class="dashboard-container">
    <!-- Row 1: Core Metric Cards -->
    <el-row :gutter="16" class="metric-row">
      <el-col :xs="12" :sm="12" :md="6" v-for="item in metricCards" :key="item.title">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-card__header">
            <span class="metric-card__title">{{ item.title }}</span>
            <el-icon :size="20" :style="{ color: item.iconColor }">
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="metric-card__value">{{ item.value }}</div>
          <div class="metric-card__footer">
            <span
              class="metric-card__change"
              :class="item.change >= 0 ? 'is-up' : 'is-down'"
            >
              <el-icon :size="12">
                <component :is="item.change >= 0 ? 'Top' : 'Bottom'" />
              </el-icon>
              {{ Math.abs(item.change) }}%
            </span>
            <span class="metric-card__hint">较昨日</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Row 2: Charts -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="chart-card__header">
              <span class="chart-card__title">用户增长趋势</span>
              <el-radio-group v-model="userGrowthRange" size="small" @change="handleRangeChange">
                <el-radio-button value="week">近7天</el-radio-button>
                <el-radio-button value="month">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="userGrowthChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="chart-card__header">
              <span class="chart-card__title">训练活跃趋势</span>
              <el-radio-group v-model="trainingActivityRange" size="small" @change="handleRangeChange">
                <el-radio-button value="week">近7天</el-radio-button>
                <el-radio-button value="month">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trainingActivityChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Row 3: Popular Exercises & AI Overview -->
    <el-row :gutter="16" class="bottom-row">
      <el-col :xs="24" :md="14">
        <el-card shadow="hover" class="table-card">
          <template #header>
            <span class="chart-card__title">热门动作 Top 10</span>
          </template>
          <el-table :data="popularExercises" stripe style="width: 100%" max-height="400">
            <el-table-column type="index" label="排名" width="70" align="center">
              <template #default="{ $index }">
                <span
                  class="rank-badge"
                  :class="{ 'is-top': $index < 3 }"
                >{{ $index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="动作名称" min-width="120" />
            <el-table-column prop="category" label="分类" width="100" />
            <el-table-column prop="bodyPart" label="部位" width="100" />
            <el-table-column prop="count" label="完成次数" width="100" align="right" sortable />
            <el-table-column prop="trend" label="趋势" width="80" align="center">
              <template #default="{ row }">
                <el-icon
                  :size="14"
                  :style="{ color: row.trend >= 0 ? '#67C23A' : '#F56C6C' }"
                >
                  <component :is="row.trend >= 0 ? 'Top' : 'Bottom'" />
                </el-icon>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="10">
        <el-card shadow="hover" class="ai-card">
          <template #header>
            <span class="chart-card__title">AI 使用概览</span>
          </template>
          <div class="ai-metrics">
            <div class="ai-metric-item" v-for="item in aiMetrics" :key="item.title">
              <div class="ai-metric-item__icon" :style="{ background: item.bgColor }">
                <el-icon :size="22" :style="{ color: item.iconColor }">
                  <component :is="item.icon" />
                </el-icon>
              </div>
              <div class="ai-metric-item__content">
                <div class="ai-metric-item__label">{{ item.title }}</div>
                <div class="ai-metric-item__value">{{ item.value }}</div>
                <div class="ai-metric-item__sub">{{ item.sub }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { dashboardApi, type DashboardOverview, type TrendData } from '@/api/dashboard'

// ─── Metric Cards ──────────────────────────────────────────────────
const metricCards = reactive([
  {
    title: '今日新增用户',
    value: 0,
    change: 0,
    icon: 'User',
    iconColor: '#409EFF',
  },
  {
    title: 'DAU',
    value: 0,
    change: 0,
    icon: 'DataLine',
    iconColor: '#67C23A',
  },
  {
    title: '今日训练',
    value: 0,
    change: 0,
    icon: 'TrendCharts',
    iconColor: '#E6A23C',
  },
  {
    title: '今日打卡',
    value: 0,
    change: 0,
    icon: 'CircleCheck',
    iconColor: '#F56C6C',
  },
])

// ─── Popular Exercises ─────────────────────────────────────────────
const popularExercises = ref([])

// ─── AI Metrics ────────────────────────────────────────────────────
const aiMetrics = ref([])

// ─── Charts ────────────────────────────────────────────────────────
const userGrowthChartRef = ref<HTMLDivElement>()
const trainingActivityChartRef = ref<HTMLDivElement>()
let userGrowthChart: echarts.ECharts | null = null
let trainingActivityChart: echarts.ECharts | null = null

const userGrowthRange = ref('week')
const trainingActivityRange = ref('week')

// 存储趋势数据
let userGrowthData: TrendData[] = []
let trainingActivityData: TrendData[] = []

// 加载数据
async function loadData(days: number = 7) {
  try {
    const data: DashboardOverview = await dashboardApi.overview(days)

    // 更新指标卡片
    if (data.metricCards) {
      data.metricCards.forEach((card, index) => {
        if (metricCards[index]) {
          metricCards[index].value = card.value
          metricCards[index].change = card.change
        }
      })
    }

    // 更新趋势数据
    userGrowthData = data.userGrowthTrend || []
    trainingActivityData = data.trainingActivityTrend || []

    // 更新图表
    updateUserGrowthChart(userGrowthData)
    updateTrainingActivityChart(trainingActivityData)

    // 更新热门动作
    popularExercises.value = data.popularExercises || []

    // 更新AI指标
    if (data.aiOverview) {
      const ai = data.aiOverview
      aiMetrics.value = [
        {
          title: 'AI 对话总量',
          value: formatNumber(ai.totalChatSessions),
          sub: `较昨日 ${formatChange(ai.chatSessionsChange)}`,
          icon: 'ChatDotRound',
          bgColor: 'rgba(108, 92, 231, 0.1)',
          iconColor: '#6C5CE7',
        },
        {
          title: 'AI 计划生成',
          value: formatNumber(ai.totalPlanGenerated),
          sub: `较昨日 ${formatChange(ai.planGeneratedChange)}`,
          icon: 'MagicStick',
          bgColor: 'rgba(255, 107, 53, 0.1)',
          iconColor: '#FF6B35',
        },
        {
          title: '知识库命中率',
          value: `${ai.ragHitRate}%`,
          sub: `较昨日 ${ai.ragHitRateChange >= 0 ? '+' : ''}${ai.ragHitRateChange}%`,
          icon: 'Connection',
          bgColor: 'rgba(103, 194, 58, 0.1)',
          iconColor: '#67C23A',
        },
        {
          title: '平均响应时间',
          value: formatTime(ai.avgResponseTime),
          sub: `较昨日 ${formatTimeChange(ai.avgResponseTimeChange)}`,
          icon: 'Timer',
          bgColor: 'rgba(230, 162, 60, 0.1)',
          iconColor: '#E6A23C',
        },
        {
          title: '安全拦截次数',
          value: formatNumber(ai.safetyBlockCount),
          sub: `较昨日 ${formatChange(ai.safetyBlockChange)}`,
          icon: 'Shield',
          bgColor: 'rgba(245, 108, 108, 0.1)',
          iconColor: '#F56C6C',
        },
      ]
    }
  } catch (error) {
    console.error('加载数据看板失败:', error)
  }
}

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

// 格式化变化
function formatChange(change: number): string {
  if (change >= 0) {
    return `+${change}%`
  }
  return `${change}%`
}

// 格式化时间
function formatTime(ms: number): string {
  if (ms >= 1000) {
    return (ms / 1000).toFixed(1) + 's'
  }
  return ms + 'ms'
}

// 格式化时间变化
function formatTimeChange(change: number): string {
  if (change >= 0) {
    return `+${formatTime(change)}`
  }
  return formatTime(change)
}

function initUserGrowthChart() {
  if (!userGrowthChartRef.value) return
  userGrowthChart = echarts.init(userGrowthChartRef.value)
}

function updateUserGrowthChart(trendData: TrendData[]) {
  if (!userGrowthChart || !trendData.length) return

  const dates = trendData.map(d => d.date)
  const newUsers = trendData.map(d => d.series?.find(s => s.name === '新增用户')?.value || 0)
  const activeUsers = trendData.map(d => d.series?.find(s => s.name === '活跃用户')?.value || 0)

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#eee',
      textStyle: { color: '#303133' },
    },
    legend: {
      data: ['新增用户', '活跃用户'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '14%',
      top: '8%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#DCDFE6' } },
      axisLabel: { color: '#909399' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#F2F6FC', type: 'dashed' } },
      axisLabel: { color: '#909399' },
    },
    series: [
      {
        name: '新增用户',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: newUsers,
        itemStyle: { color: '#FF6B35' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 107, 53, 0.25)' },
            { offset: 1, color: 'rgba(255, 107, 53, 0.02)' },
          ]),
        },
      },
      {
        name: '活跃用户',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: activeUsers,
        itemStyle: { color: '#6C5CE7' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(108, 92, 231, 0.25)' },
            { offset: 1, color: 'rgba(108, 92, 231, 0.02)' },
          ]),
        },
      },
    ],
  }
  userGrowthChart.setOption(option, true)
}

function initTrainingActivityChart() {
  if (!trainingActivityChartRef.value) return
  trainingActivityChart = echarts.init(trainingActivityChartRef.value)
}

function updateTrainingActivityChart(trendData: TrendData[]) {
  if (!trainingActivityChart || !trendData.length) return

  const dates = trendData.map(d => d.date)
  const workoutCounts = trendData.map(d => d.series?.find(s => s.name === '训练次数')?.value || 0)
  const checkinCounts = trendData.map(d => d.series?.find(s => s.name === '打卡次数')?.value || 0)

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#eee',
      textStyle: { color: '#303133' },
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['训练次数', '打卡次数'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '14%',
      top: '8%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#DCDFE6' } },
      axisLabel: { color: '#909399' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#F2F6FC', type: 'dashed' } },
      axisLabel: { color: '#909399' },
    },
    series: [
      {
        name: '训练次数',
        type: 'bar',
        barWidth: dates.length > 14 ? '40%' : '30%',
        data: workoutCounts,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#FF8C5A' },
            { offset: 1, color: '#FF6B35' },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: '打卡次数',
        type: 'bar',
        barWidth: dates.length > 14 ? '40%' : '30%',
        data: checkinCounts,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#8B7EED' },
            { offset: 1, color: '#6C5CE7' },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  }
  trainingActivityChart.setOption(option, true)
}

function handleRangeChange() {
  const days = userGrowthRange.value === 'week' ? 7 : 30
  loadData(days)
}

function handleResize() {
  userGrowthChart?.resize()
  trainingActivityChart?.resize()
}

// ─── Lifecycle ─────────────────────────────────────────────────────
onMounted(() => {
  initUserGrowthChart()
  initTrainingActivityChart()
  loadData(7)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  userGrowthChart?.dispose()
  trainingActivityChart?.dispose()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.dashboard-container {
  padding: 16px;
}

// ─── Metric Cards ──────────────────────────────────────────────
.metric-row {
  margin-bottom: 16px;
}

.metric-card {
  margin-bottom: 16px;

  :deep(.el-card__body) {
    padding: 20px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  &__title {
    font-size: 14px;
    color: $text-secondary;
  }

  &__value {
    font-size: 28px;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 12px;
    font-variant-numeric: tabular-nums;
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__change {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 13px;
    font-weight: 500;

    &.is-up {
      color: $success-color;
    }

    &.is-down {
      color: $danger-color;
    }
  }

  &__hint {
    font-size: 12px;
    color: $text-placeholder;
  }
}

// ─── Chart Cards ───────────────────────────────────────────────
.chart-row {
  margin-bottom: 16px;
}

.chart-card {
  margin-bottom: 16px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }
}

.chart-container {
  width: 100%;
  height: 320px;
}

// ─── Table Card ────────────────────────────────────────────────
.table-card {
  margin-bottom: 16px;
}

.rank-badge {
  display: inline-block;
  width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  color: $text-secondary;
  background: $bg-color;

  &.is-top {
    color: #fff;
    background: linear-gradient(135deg, #ff8c5a, $primary-color);
  }
}

// ─── AI Overview Card ──────────────────────────────────────────
.ai-card {
  margin-bottom: 16px;
}

.ai-metrics {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.ai-metric-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 8px;
  background: $bg-color;
  transition: background 0.2s;

  &:hover {
    background: darken($bg-color, 2%);
  }

  &__icon {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__label {
    font-size: 13px;
    color: $text-secondary;
    margin-bottom: 2px;
  }

  &__value {
    font-size: 20px;
    font-weight: 700;
    color: $text-primary;
    font-variant-numeric: tabular-nums;
  }

  &__sub {
    font-size: 12px;
    color: $text-placeholder;
    margin-top: 2px;
  }
}

// ─── Responsive ────────────────────────────────────────────────
@media (max-width: $breakpoint-sm) {
  .dashboard-container {
    padding: 12px;
  }

  .chart-container {
    height: 260px;
  }

  .metric-card__value {
    font-size: 22px;
  }
}
</style>
