<template>
  <div class="chat-monitor-page">
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ stats.totalSessions }}</div>
          <div class="stat-label">总会话数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ stats.totalMessages }}</div>
          <div class="stat-label">总消息数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card stat-positive">
          <div class="stat-value">{{ stats.thumbsUp }}</div>
          <div class="stat-label">好评数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card stat-negative">
          <div class="stat-value">{{ stats.thumbsDown }}</div>
          <div class="stat-label">差评数</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filters" @submit.prevent="handleSearch">
        <el-form-item label="用户ID">
          <el-input
            v-model="filterUserId"
            placeholder="输入用户ID筛选"
            clearable
            style="width: 160px"
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="反馈状态">
          <el-select v-model="filters.feedbackStatus" placeholder="全部" clearable @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="有好评" value="positive" />
            <el-option label="有差评" value="negative" />
            <el-option label="无反馈" value="none" />
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
        <span>会话列表</span>
      </template>

      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="会话ID" width="80" />
        <el-table-column prop="userId" label="用户ID" width="90" align="center" />
        <el-table-column prop="title" label="会话标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sessionType" label="会话类型" width="100" align="center" />
        <el-table-column prop="messageCount" label="消息数" width="90" align="center" />
        <el-table-column prop="updatedAt" label="最后更新" width="180" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '进行中' : '已结束' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">查看详情</el-button>
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
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chatMonitorApi } from '@/api/ai/chat-monitor'
import { usePagination } from '@/composables/usePagination'
import { useTableSearch } from '@/composables/useTableSearch'

const route = useRoute()
const router = useRouter()

const filterUserId = ref<string>(route.query.user_id as string || '')

const stats = reactive({
  totalSessions: 0,
  totalMessages: 0,
  thumbsUp: 0,
  thumbsDown: 0,
})

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange, resetPage } =
  usePagination(chatMonitorApi.sessions)

const { filters, getSearchParams, resetFilters } = useTableSearch({
  dateRange: null as string[] | null,
  feedbackStatus: '',
})

function handleSearch() {
  resetPage()
  const params = getSearchParams()
  if (filters.dateRange && filters.dateRange.length === 2) {
    params.startDate = filters.dateRange[0]
    params.endDate = filters.dateRange[1]
  }
  delete params.dateRange
  if (filterUserId.value) {
    params.userId = filterUserId.value
  }
  loadData(params)
}

function handleReset() {
  resetFilters()
  filterUserId.value = ''
  handleSearch()
}

function handleViewDetail(row: { id: number }) {
  router.push(`/ai/chat-monitor/detail/${row.id}`)
}

async function loadStats() {
  const res = (await chatMonitorApi.feedbackStats()) as unknown as {
    data: { totalSessions: number; totalMessages: number; thumbsUp: number; thumbsDown: number }
  }
  Object.assign(stats, res.data)
}

onMounted(() => {
  if (filterUserId.value) {
    handleSearch()
  } else {
    loadData()
  }
  loadStats()
})
</script>

<style lang="scss" scoped>
.chat-monitor-page {
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

  &.stat-positive .stat-value {
    color: #67C23A;
  }

  &.stat-negative .stat-value {
    color: #F56C6C;
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
