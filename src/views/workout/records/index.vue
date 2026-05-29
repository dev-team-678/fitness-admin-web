<template>
  <div class="workout-records">
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="用户 ID">
          <el-input v-model="filters.userId" placeholder="请输入用户 ID" clearable />
        </el-form-item>
        <el-form-item label="计划名称">
          <el-input v-model="filters.planName" placeholder="请输入计划名称" clearable />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="userId" label="用户 ID" width="100" />
        <el-table-column prop="userName" label="用户名称" width="120" />
        <el-table-column prop="planName" label="训练计划" min-width="150" show-overflow-tooltip />
        <el-table-column prop="date" label="训练日期" width="120" />
        <el-table-column prop="duration" label="时长 (min)" width="100" sortable />
        <el-table-column prop="totalVolume" label="训练量 (kg)" width="120" sortable />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'warning' : 'info'" size="small">
              {{ statusMap[row.status as number] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="exercisesSummary" label="动作摘要" min-width="200" show-overflow-tooltip />
      </el-table>

      <el-pagination
        class="pagination"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        :page-size="pagination.pageSize"
        :current-page="pagination.page"
        :page-sizes="[10, 20, 50, 100]"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { workoutAnalyticsApi } from '@/api/workout/analytics'
import { usePagination } from '@/composables/usePagination'
import { useTableSearch } from '@/composables/useTableSearch'

const statusMap: Record<number, string> = {
  0: '未开始',
  1: '已完成',
  2: '进行中',
}

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange, resetPage } =
  usePagination(workoutAnalyticsApi.records as (params: Record<string, unknown>) => Promise<unknown>)

const { filters, getSearchParams, resetFilters } = useTableSearch({
  userId: '',
  planName: '',
})

const dateRange = ref<[string, string] | null>(null)

function buildParams() {
  const params = getSearchParams()
  if (dateRange.value) {
    params.startDate = dateRange.value[0]
    params.endDate = dateRange.value[1]
  }
  return params
}

function handleSearch() {
  resetPage()
  loadData(buildParams())
}

function handleReset() {
  resetFilters()
  dateRange.value = null
  resetPage()
  loadData()
}

async function handleExport() {
  try {
    const res = await workoutAnalyticsApi.exportRecords(buildParams())
    const blob = new Blob([(res as unknown as Blob)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `workout-records-${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.workout-records {
  padding: 16px;
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
