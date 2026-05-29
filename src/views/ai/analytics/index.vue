<template>
  <div class="ai-analytics-page">
    <el-row :gutter="16" class="metrics-row">
      <el-col :span="4" :offset="0">
        <el-card shadow="never" class="metric-card">
          <div class="metric-icon" style="background: #6C5CE7">
            <el-icon :size="24"><ChatDotRound /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ overview.sessionCount }}</div>
            <div class="metric-label">会话数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card shadow="never" class="metric-card">
          <div class="metric-icon" style="background: #0984e3">
            <el-icon :size="24"><Comment /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ overview.messageCount }}</div>
            <div class="metric-label">消息数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card shadow="never" class="metric-card">
          <div class="metric-icon" style="background: #00b894">
            <el-icon :size="24"><CircleCheck /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ overview.satisfactionRate }}%</div>
            <div class="metric-label">满意度</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card shadow="never" class="metric-card">
          <div class="metric-icon" style="background: #fdcb6e">
            <el-icon :size="24"><Document /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ overview.plansGenerated }}</div>
            <div class="metric-label">生成计划</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card shadow="never" class="metric-card">
          <div class="metric-icon" style="background: #e17055">
            <el-icon :size="24"><Coin /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ formatTokens(overview.tokenUsage) }}</div>
            <div class="metric-label">Token 用量</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="charts-row">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header><span>对话趋势</span></template>
          <div ref="chatTrendChartRef" class="chart-container" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header><span>满意度趋势</span></template>
          <div ref="satisfactionChartRef" class="chart-container" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="lists-row">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header><span>热门问题 Top 10</span></template>
          <el-table :data="hotQuestions" border size="small">
            <el-table-column type="index" label="#" width="50" />
            <el-table-column prop="question" label="问题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="count" label="次数" width="80" align="center" />
            <el-table-column prop="rate" label="满意率" width="80" align="center">
              <template #default="{ row }">
                <span :style="{ color: row.rate >= 80 ? '#67C23A' : row.rate >= 60 ? '#E6A23C' : '#F56C6C' }">
                  {{ row.rate }}%
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header><span>知识召回 Top 10</span></template>
          <el-table :data="knowledgeRecall" border size="small">
            <el-table-column type="index" label="#" width="50" />
            <el-table-column prop="title" label="知识标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="recallCount" label="召回次数" width="90" align="center" />
            <el-table-column prop="avgScore" label="平均分" width="80" align="center">
              <template #default="{ row }">
                {{ (row.avgScore * 100).toFixed(0) }}%
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ChatDotRound, Comment, CircleCheck, Document, Coin } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { aiAnalyticsApi } from '@/api/ai/analytics'

interface HotQuestion {
  question: string
  count: number
  rate: number
}

interface KnowledgeRecallItem {
  title: string
  recallCount: number
  avgScore: number
}

interface TrendPoint {
  date: string
  count?: number
  positive?: number
  negative?: number
  neutral?: number
}

const overview = reactive({
  sessionCount: 0,
  messageCount: 0,
  satisfactionRate: 0,
  plansGenerated: 0,
  tokenUsage: 0,
})

const hotQuestions = ref<HotQuestion[]>([])
const knowledgeRecall = ref<KnowledgeRecallItem[]>([])

const chatTrendChartRef = ref<HTMLDivElement>()
const satisfactionChartRef = ref<HTMLDivElement>()
let chatTrendChart: echarts.ECharts | null = null
let satisfactionChart: echarts.ECharts | null = null

function formatTokens(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function initChatTrendChart(data: TrendPoint[]) {
  if (!chatTrendChartRef.value) return
  chatTrendChart = echarts.init(chatTrendChartRef.value)
  chatTrendChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    xAxis: { type: 'category', data: data.map((d) => d.date), boundaryGap: false },
    yAxis: { type: 'value' },
    series: [
      {
        name: '消息数',
        type: 'line',
        data: data.map((d) => d.count),
        smooth: true,
        areaStyle: { color: 'rgba(108, 92, 231, 0.15)' },
        lineStyle: { color: '#6C5CE7', width: 2 },
        itemStyle: { color: '#6C5CE7' },
      },
    ],
  })
}

function initSatisfactionChart(data: TrendPoint[]) {
  if (!satisfactionChartRef.value) return
  satisfactionChart = echarts.init(satisfactionChartRef.value)
  satisfactionChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['好评', '中性', '差评'], bottom: 0 },
    grid: { top: 20, right: 20, bottom: 40, left: 50 },
    xAxis: { type: 'category', data: data.map((d) => d.date) },
    yAxis: { type: 'value' },
    series: [
      {
        name: '好评',
        type: 'bar',
        stack: 'total',
        data: data.map((d) => d.positive),
        itemStyle: { color: '#67C23A' },
      },
      {
        name: '中性',
        type: 'bar',
        stack: 'total',
        data: data.map((d) => d.neutral),
        itemStyle: { color: '#909399' },
      },
      {
        name: '差评',
        type: 'bar',
        stack: 'total',
        data: data.map((d) => d.negative),
        itemStyle: { color: '#F56C6C' },
      },
    ],
  })
}

function handleResize() {
  chatTrendChart?.resize()
  satisfactionChart?.resize()
}

async function loadData() {
  const [overviewRes, chatTrendRes, satisfactionRes, hotQuestionsRes, knowledgeRes] = await Promise.all([
    aiAnalyticsApi.overview(),
    aiAnalyticsApi.chatTrend(),
    aiAnalyticsApi.satisfactionTrend(),
    aiAnalyticsApi.hotQuestions(),
    aiAnalyticsApi.knowledgeUsage(),
  ])

  const o = (overviewRes as unknown as { data: typeof overview }).data
  Object.assign(overview, o)

  hotQuestions.value = ((hotQuestionsRes as unknown as { data: HotQuestion[] }).data || []).slice(0, 10)
  knowledgeRecall.value = ((knowledgeRes as unknown as { data: KnowledgeRecallItem[] }).data || []).slice(0, 10)

  await nextTick()
  initChatTrendChart((chatTrendRes as unknown as { data: TrendPoint[] }).data || [])
  initSatisfactionChart((satisfactionRes as unknown as { data: TrendPoint[] }).data || [])
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chatTrendChart?.dispose()
  satisfactionChart?.dispose()
})
</script>

<style lang="scss" scoped>
.ai-analytics-page {
  padding: 16px;
}

.metrics-row {
  margin-bottom: 16px;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.metric-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  color: #fff;
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  line-height: 1.3;
}

.metric-label {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.charts-row {
  margin-bottom: 16px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.lists-row {
  margin-bottom: 16px;
}
</style>
