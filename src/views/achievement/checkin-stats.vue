<template>
  <div class="checkin-stats">
    <!-- Summary Cards -->
    <el-row :gutter="16" class="summary-row">
      <el-col :span="8">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-value">{{ statsData.todayCount?.toLocaleString() ?? '--' }}</div>
          <div class="summary-label">今日签到</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-value">{{ statsData.days ?? '--' }}</div>
          <div class="summary-label">统计天数</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-value">{{ statsData.dailyStats?.length ?? '--' }}</div>
          <div class="summary-label">数据点数</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Trend Chart -->
    <el-card shadow="never" class="chart-card">
      <template #header>
        <div class="chart-header">
          <span>签到趋势</span>
          <el-radio-group v-model="trendType" size="small" @change="loadTrend">
            <el-radio-button value="daily">按日</el-radio-button>
            <el-radio-button value="weekly">按周</el-radio-button>
            <el-radio-button value="monthly">按月</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div ref="trendChartRef" class="chart-container" />
    </el-card>

    <!-- Leaderboard Table -->
    <el-card shadow="never" class="table-card">
      <template #header><span>连续签到排行榜</span></template>
      <el-table :data="leaderboard" v-loading="leaderboardLoading" stripe>
        <el-table-column type="index" label="排名" width="70">
          <template #default="{ $index }">
            <span :class="['rank', `rank-${$index + 1}`]">{{ $index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="userId" label="用户 ID" width="120" />
        <el-table-column prop="nickname" label="用户名称" min-width="140" />
        <el-table-column prop="streakDays" label="连续签到天数" width="140" sortable>
          <template #default="{ row }">
            <span class="consecutive-days">{{ row.streakDays }} 天</span>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="结束日期" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { checkinApi } from '@/api/achievement/checkin'

const statsData = reactive<Record<string, unknown>>({
  todayCount: 0,
  days: 0,
  dailyStats: [],
})

const trendType = ref('daily')
const trendChartRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null
const leaderboard = ref<Record<string, unknown>[]>([])
const leaderboardLoading = ref(false)

async function loadStats() {
  try {
    const res = await checkinApi.stats()
    const data = (res as { data: Record<string, number> }).data
    Object.assign(statsData, data)
  } catch {
    // handled by interceptor
  }
}

async function loadTrend() {
  try {
    const res = await checkinApi.stats({ type: trendType.value })
    const data = (res as { data: { dailyStats: { checkinDate: string; count: number }[] } }).data
    if (!trendChart) return
    const dates = (data.dailyStats || []).map((d) => d.checkinDate)
    const counts = (data.dailyStats || []).map((d) => d.count)
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['签到人数'] },
      grid: { left: 50, right: 50, bottom: 30, top: 40 },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value', name: '人数' },
      series: [
        {
          name: '签到人数',
          type: 'bar',
          data: counts,
          itemStyle: { color: '#E6A23C' },
        },
      ],
    })
  } catch {
    // handled by interceptor
  }
}

async function loadLeaderboard() {
  leaderboardLoading.value = true
  try {
    const res = await checkinApi.leaderboard()
    leaderboard.value = (res as { data: Record<string, unknown>[] }).data || []
  } catch {
    // handled by interceptor
  } finally {
    leaderboardLoading.value = false
  }
}

function handleResize() {
  trendChart?.resize()
}

onMounted(async () => {
  await nextTick()
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
  }
  loadStats()
  loadTrend()
  loadLeaderboard()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
})
</script>

<style lang="scss" scoped>
.checkin-stats {
  padding: 16px;
}

.summary-row {
  margin-bottom: 16px;
}

.summary-card {
  text-align: center;
  padding: 12px 0;

  .summary-value {
    font-size: 32px;
    font-weight: 700;
    color: #303133;
    line-height: 1.4;
  }

  .summary-label {
    font-size: 14px;
    color: #909399;
    margin-top: 4px;
  }

  .summary-rate {
    font-size: 13px;
    color: #67c23a;
    margin-top: 4px;
  }
}

.chart-card {
  margin-bottom: 16px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-container {
  width: 100%;
  height: 360px;
}

.table-card {
  margin-bottom: 16px;
}

.rank {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  background: #e4e7ed;
  color: #606266;

  &.rank-1 {
    background: #f7ba2a;
    color: #fff;
  }

  &.rank-2 {
    background: #c0c4cc;
    color: #fff;
  }

  &.rank-3 {
    background: #cd7f32;
    color: #fff;
  }
}

.consecutive-days {
  font-weight: 600;
  color: #e6a23c;
}
</style>
