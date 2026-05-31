<template>
  <div class="workout-analytics">
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="loadAll"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadAll">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Metric Cards -->
    <el-row :gutter="16" class="metric-row">
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-value">{{ overviewData.totalWorkouts?.toLocaleString() ?? '--' }}</div>
          <div class="metric-label">总训练次数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-value">{{ overviewData.completionRate != null ? overviewData.completionRate.toFixed(1) + '%' : '--' }}</div>
          <div class="metric-label">完成率</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-value">{{ overviewData.avgDurationMin != null ? overviewData.avgDurationMin + ' min' : '--' }}</div>
          <div class="metric-label">平均时长</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-value">{{ overviewData.totalVolumeKg?.toLocaleString() ?? '--' }} kg</div>
          <div class="metric-label">总训练量</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts Row -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="14">
        <el-card shadow="never">
          <template #header><span>训练趋势</span></template>
          <div ref="trendChartRef" class="chart-container" />
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="never">
          <template #header><span>高峰时段热力图</span></template>
          <div ref="heatmapChartRef" class="chart-container" />
        </el-card>
      </el-col>
    </el-row>

    <!-- Popular Exercises Table -->
    <el-card shadow="never" class="table-card">
      <template #header><span>热门动作 Top 10</span></template>
      <el-table :data="exerciseList" v-loading="exerciseLoading" stripe>
        <el-table-column type="index" label="排名" width="70" />
        <el-table-column prop="name" label="动作名称" />
        <el-table-column prop="count" label="训练次数" sortable />
        <el-table-column prop="totalVolume" label="总训练量 (kg)" sortable />
        <el-table-column prop="avgWeight" label="平均重量 (kg)" />
        <el-table-column prop="userCount" label="参与用户数" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { workoutAnalyticsApi } from '@/api/workout/analytics'

const dateRange = ref<[string, string] | null>(null)

// Overview metrics
const overviewData = reactive<Record<string, number>>({
  totalWorkouts: 0,
  completionRate: 0,
  avgDuration: 0,
  totalVolume: 0,
})

// Trend chart
const trendChartRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null

// Heatmap chart
const heatmapChartRef = ref<HTMLElement>()
let heatmapChart: echarts.ECharts | null = null

// Exercise table
const exerciseList = ref<Record<string, unknown>[]>([])
const exerciseLoading = ref(false)

function getDateParams() {
  if (dateRange.value) {
    return { startDate: dateRange.value[0], endDate: dateRange.value[1] }
  }
  return {}
}

async function loadOverview() {
  try {
    const res = await workoutAnalyticsApi.overview(getDateParams())
    const data = (res as { data: Record<string, number> }).data
    Object.assign(overviewData, data)
  } catch {
    // handled by interceptor
  }
}

async function loadTrend() {
  try {
    const res = await workoutAnalyticsApi.trend(getDateParams())
    const data = (res as { data: { dates: string[]; counts: number[]; volumes: number[] } }).data
    if (!trendChart) return
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['训练次数', '训练量'] },
      grid: { left: 50, right: 50, bottom: 30, top: 40 },
      xAxis: { type: 'category', data: data.dates },
      yAxis: [
        { type: 'value', name: '次数' },
        { type: 'value', name: '训练量 (kg)', alignTicks: true },
      ],
      series: [
        {
          name: '训练次数',
          type: 'bar',
          data: data.counts,
          itemStyle: { color: '#409EFF' },
        },
        {
          name: '训练量',
          type: 'line',
          yAxisIndex: 1,
          data: data.volumes,
          smooth: true,
          itemStyle: { color: '#67C23A' },
        },
      ],
    })
  } catch {
    // handled by interceptor
  }
}

async function loadPeakHours() {
  try {
    const res = await workoutAnalyticsApi.peakHours(getDateParams())
    const data = (res as { data: { hours: number[]; days: string[]; values: [number, number, number][] } }).data
    if (!heatmapChart) return
    heatmapChart.setOption({
      tooltip: {
        formatter(params: { value: [number, number, number] }) {
          return `${data.days[params.value[1]]} ${data.hours[params.value[0]]}:00 - 训练次数: ${params.value[2]}`
        },
      },
      grid: { left: 60, right: 30, bottom: 30, top: 10 },
      xAxis: {
        type: 'category',
        data: data.hours.map((h: number) => `${h}:00`),
        splitArea: { show: true },
      },
      yAxis: {
        type: 'category',
        data: data.days,
        splitArea: { show: true },
      },
      visualMap: {
        min: 0,
        max: Math.max(...data.values.map((v) => v[2]), 1),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        inRange: { color: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'] },
      },
      series: [
        {
          type: 'heatmap',
          data: data.values,
          label: { show: false },
          emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
        },
      ],
    })
  } catch {
    // handled by interceptor
  }
}

async function loadExercises() {
  exerciseLoading.value = true
  try {
    const res = await workoutAnalyticsApi.exercisePopularity(getDateParams())
    exerciseList.value = (res as { data: Record<string, unknown>[] }).data || []
  } catch {
    // handled by interceptor
  } finally {
    exerciseLoading.value = false
  }
}

function initCharts() {
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
  }
  if (heatmapChartRef.value) {
    heatmapChart = echarts.init(heatmapChartRef.value)
  }
}

function handleResize() {
  trendChart?.resize()
  heatmapChart?.resize()
}

function loadAll() {
  loadOverview()
  loadTrend()
  loadPeakHours()
  loadExercises()
}

onMounted(async () => {
  await nextTick()
  initCharts()
  loadAll()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  heatmapChart?.dispose()
})
</script>

<style lang="scss" scoped>
.workout-analytics {
  padding: 16px;
}

.filter-card {
  margin-bottom: 16px;
}

.metric-row {
  margin-bottom: 16px;
}

.metric-card {
  text-align: center;
  padding: 12px 0;

  .metric-value {
    font-size: 28px;
    font-weight: 700;
    color: #303133;
    line-height: 1.4;
  }

  .metric-label {
    font-size: 14px;
    color: #909399;
    margin-top: 4px;
  }
}

.chart-row {
  margin-bottom: 16px;
}

.chart-container {
  width: 100%;
  height: 360px;
}

.table-card {
  margin-bottom: 16px;
}
</style>
