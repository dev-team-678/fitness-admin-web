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
              <el-radio-group v-model="userGrowthRange" size="small" @change="handleUserGrowthRangeChange">
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
              <el-radio-group v-model="trainingActivityRange" size="small" @change="handleTrainingActivityRangeChange">
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
import { workoutAnalyticsApi } from '@/api/workout/analytics'

// ─── Metric Cards ──────────────────────────────────────────────────
const metricCards = reactive([
  {
    title: '今日新增用户',
    value: 128,
    change: 12.5,
    icon: 'User',
    iconColor: '#409EFF',
  },
  {
    title: 'DAU',
    value: 3562,
    change: 5.2,
    icon: 'DataLine',
    iconColor: '#67C23A',
  },
  {
    title: '今日训练',
    value: 892,
    change: -3.1,
    icon: 'TrendCharts',
    iconColor: '#E6A23C',
  },
  {
    title: '今日打卡',
    value: 654,
    change: 8.7,
    icon: 'CircleCheck',
    iconColor: '#F56C6C',
  },
])

// ─── Popular Exercises ─────────────────────────────────────────────
const popularExercises = ref([
  { name: '深蹲', category: '力量训练', bodyPart: '腿部', count: 2340, trend: 15 },
  { name: '俯卧撑', category: '自重训练', bodyPart: '胸部', count: 1980, trend: 8 },
  { name: '硬拉', category: '力量训练', bodyPart: '背部', count: 1756, trend: 12 },
  { name: '卧推', category: '力量训练', bodyPart: '胸部', count: 1650, trend: -2 },
  { name: '引体向上', category: '自重训练', bodyPart: '背部', count: 1420, trend: 6 },
  { name: '平板支撑', category: '核心训练', bodyPart: '核心', count: 1380, trend: 18 },
  { name: '弓步蹲', category: '力量训练', bodyPart: '腿部', count: 1210, trend: -5 },
  { name: '肩推', category: '力量训练', bodyPart: '肩部', count: 1050, trend: 3 },
  { name: '卷腹', category: '核心训练', bodyPart: '核心', count: 980, trend: 10 },
  { name: '波比跳', category: 'HIIT', bodyPart: '全身', count: 870, trend: 22 },
])

// ─── AI Metrics ────────────────────────────────────────────────────
const aiMetrics = ref([
  {
    title: 'AI 对话总量',
    value: '12,845',
    sub: '较昨日 +18.3%',
    icon: 'ChatDotRound',
    bgColor: 'rgba(108, 92, 231, 0.1)',
    iconColor: '#6C5CE7',
  },
  {
    title: 'AI 计划生成',
    value: '1,024',
    sub: '较昨日 +9.6%',
    icon: 'MagicStick',
    bgColor: 'rgba(255, 107, 53, 0.1)',
    iconColor: '#FF6B35',
  },
  {
    title: '知识库命中率',
    value: '87.2%',
    sub: '较昨日 +2.1%',
    icon: 'Connection',
    bgColor: 'rgba(103, 194, 58, 0.1)',
    iconColor: '#67C23A',
  },
  {
    title: '平均响应时间',
    value: '1.2s',
    sub: '较昨日 -0.3s',
    icon: 'Timer',
    bgColor: 'rgba(230, 162, 60, 0.1)',
    iconColor: '#E6A23C',
  },
  {
    title: '安全拦截次数',
    value: '23',
    sub: '较昨日 -15',
    icon: 'Shield',
    bgColor: 'rgba(245, 108, 108, 0.1)',
    iconColor: '#F56C6C',
  },
])

// ─── Charts ────────────────────────────────────────────────────────
const userGrowthChartRef = ref<HTMLDivElement>()
const trainingActivityChartRef = ref<HTMLDivElement>()
let userGrowthChart: echarts.ECharts | null = null
let trainingActivityChart: echarts.ECharts | null = null

const userGrowthRange = ref('week')
const trainingActivityRange = ref('week')

function generateDates(days: number): string[] {
  const dates: string[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`)
  }
  return dates
}

function generateRandomData(count: number, min: number, max: number): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min)
}

function initUserGrowthChart() {
  if (!userGrowthChartRef.value) return
  userGrowthChart = echarts.init(userGrowthChartRef.value)
  const days = userGrowthRange.value === 'week' ? 7 : 30
  const dates = generateDates(days)
  updateUserGrowthChart(dates)
}

function updateUserGrowthChart(dates: string[]) {
  if (!userGrowthChart) return
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
        data: generateRandomData(dates.length, 80, 200),
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
        data: generateRandomData(dates.length, 2000, 5000),
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
  const days = trainingActivityRange.value === 'week' ? 7 : 30
  const dates = generateDates(days)
  updateTrainingActivityChart(dates)
}

function updateTrainingActivityChart(dates: string[]) {
  if (!trainingActivityChart) return
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
        data: generateRandomData(dates.length, 500, 1200),
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
        data: generateRandomData(dates.length, 300, 800),
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

function handleUserGrowthRangeChange() {
  const days = userGrowthRange.value === 'week' ? 7 : 30
  updateUserGrowthChart(generateDates(days))
}

function handleTrainingActivityRangeChange() {
  const days = trainingActivityRange.value === 'week' ? 7 : 30
  updateTrainingActivityChart(generateDates(days))
}

function handleResize() {
  userGrowthChart?.resize()
  trainingActivityChart?.resize()
}

// ─── Lifecycle ─────────────────────────────────────────────────────
onMounted(() => {
  initUserGrowthChart()
  initTrainingActivityChart()
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
