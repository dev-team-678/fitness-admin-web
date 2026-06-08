<template>
  <div class="ai-plans-page">
    <el-row :gutter="16" class="stats-row">
      <el-col :span="8">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">总生成计划数</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="stat-card stat-confirm">
          <div class="stat-value">{{ stats.converted }}</div>
          <div class="stat-label">已转化数</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="stat-card stat-complete">
          <div class="stat-value">{{ stats.conversionRate }}%</div>
          <div class="stat-label">转化率</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filters" @submit.prevent="handleSearch">
        <el-form-item label="用户 ID">
          <el-input v-model="filters.userId" placeholder="用户 ID" clearable @clear="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable style="width: 140px" @change="handleSearch">
            <el-option label="草稿" value="draft" />
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="进行中" value="active" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="训练分化">
          <el-select v-model="filters.splitType" placeholder="全部" clearable style="width: 140px" @change="handleSearch">
            <el-option label="全身" value="full_body" />
            <el-option label="上/下肢" value="upper_lower" />
            <el-option label="推/拉/腿" value="push_pull_legs" />
            <el-option label="身体部位" value="body_part" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <template #header>
        <span>AI 计划列表</span>
      </template>

      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="userId" label="用户 ID" width="100" />
        <el-table-column prop="goal" label="训练目标" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ goalText(row.goal) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="splitType" label="训练分化" width="110">
          <template #default="{ row }">
            {{ splitText(row.splitType) }}
          </template>
        </el-table-column>
        <el-table-column prop="daysPerWeek" label="天/周" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">查看详情</el-button>
            <el-button
              v-if="row.status === 'confirmed'"
              link
              type="success"
              @click="handleConvert(row)"
            >
              转为系统计划
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { aiPlanApi } from '@/api/ai/ai-plan'
import { usePagination } from '@/composables/usePagination'
import { useTableSearch } from '@/composables/useTableSearch'

const router = useRouter()

const stats = reactive({
  total: 0,
  converted: 0,
  conversionRate: 0,
})

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange, resetPage } =
  usePagination(aiPlanApi.list)

const { filters, getSearchParams, resetFilters } = useTableSearch({
  userId: '',
  splitType: '',
  status: '',
})

function goalText(goal: string) {
  const map: Record<string, string> = {
    muscle_gain: '增肌',
    fat_loss: '减脂',
    strength: '力量',
    endurance: '耐力',
    flexibility: '柔韧性',
  }
  return map[goal] || goal
}

function splitText(split: string) {
  const map: Record<string, string> = {
    full_body: '全身',
    upper_lower: '上/下肢',
    push_pull_legs: '推/拉/腿',
    body_part: '身体部位',
  }
  return map[split] || split
}

function statusType(status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined> = {
    pending: 'warning',
    confirmed: 'success',
    active: undefined,
    completed: 'success',
    cancelled: 'info',
  }
  return map[status] || 'info'
}

function statusText(status: string) {
  const map: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    active: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[status] || status
}

function handleSearch() {
  resetPage()
  loadData(getSearchParams())
}

function handleReset() {
  resetFilters()
  handleSearch()
}

function handleViewDetail(row: { id: number }) {
  if (!row.id || isNaN(Number(row.id))) {
    ElMessage.error('计划ID无效')
    return
  }
  router.push(`/ai/plans/detail/${row.id}`)
}

async function handleConvert(row: { id: number }) {
  await ElMessageBox.confirm('确认将此 AI 计划转为系统计划？', '提示', { type: 'info' })
  await aiPlanApi.convertToSystem(row.id)
  ElMessage.success('已转为系统计划')
  loadData(getSearchParams())
}

async function loadStats() {
  const res = (await aiPlanApi.stats()) as unknown as {
    data: { total: number; converted: number; conversionRate: number }
  }
  Object.assign(stats, res.data)
}

onMounted(() => {
  loadData()
  loadStats()
})
</script>

<style lang="scss" scoped>
.ai-plans-page {
  padding: 16px;
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  text-align: center;
  padding: 8px 0;

  .stat-value {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    line-height: 1.4;
  }

  .stat-label {
    font-size: 13px;
    color: #909399;
    margin-top: 4px;
  }

  &.stat-confirm .stat-value {
    color: #6C5CE7;
  }

  &.stat-complete .stat-value {
    color: #67C23A;
  }
}

.filter-card {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
