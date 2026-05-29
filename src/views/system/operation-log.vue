<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <span>操作日志</span>
      </template>

      <!-- Filters -->
      <el-form :model="filters" inline class="filter-form">
        <el-form-item label="操作人">
          <el-input v-model="filters.operator" placeholder="请输入操作人" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="filters.type" placeholder="全部" clearable style="width: 140px">
            <el-option label="新增" value="CREATE" />
            <el-option label="更新" value="UPDATE" />
            <el-option label="删除" value="DELETE" />
            <el-option label="登录" value="LOGIN" />
            <el-option label="导出" value="EXPORT" />
          </el-select>
        </el-form-item>
        <el-form-item label="模块">
          <el-input v-model="filters.module" placeholder="请输入模块名" clearable style="width: 140px" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="type" label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="typeTagMap[row.type]">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="120" />
        <el-table-column prop="targetId" label="目标ID" width="100" />
        <el-table-column label="详情" min-width="200">
          <template #default="{ row }">
            <el-popover v-if="row.details" placement="left" :width="400" trigger="click">
              <template #reference>
                <el-button type="primary" link>查看详情</el-button>
              </template>
              <pre class="json-detail">{{ formatJson(row.details) }}</pre>
            </el-popover>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP" width="140" />
        <el-table-column prop="createdAt" label="操作时间" width="180" />
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { operationLogApi } from '@/api/system/operation-log'
import { usePagination } from '@/composables/usePagination'
import { useTableSearch } from '@/composables/useTableSearch'

const typeTagMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined> = {
  CREATE: 'success',
  UPDATE: undefined,
  DELETE: 'danger',
  LOGIN: 'warning',
  EXPORT: 'info',
}

const { filters, getSearchParams, resetFilters } = useTableSearch({
  operator: '',
  type: '',
  module: '',
  dateRange: null as string[] | null,
})

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange, resetPage } =
  usePagination(operationLogApi.list)

function getExtraParams() {
  const params = getSearchParams()
  if (params.dateRange && Array.isArray(params.dateRange)) {
    params.startDate = params.dateRange[0]
    params.endDate = params.dateRange[1]
    delete params.dateRange
  }
  return params
}

function handleSearch() {
  resetPage()
  loadData(getExtraParams())
}

function handleReset() {
  resetFilters()
  resetPage()
  loadData()
}

function formatJson(details: unknown): string {
  try {
    if (typeof details === 'string') {
      return JSON.stringify(JSON.parse(details), null, 2)
    }
    return JSON.stringify(details, null, 2)
  } catch {
    return String(details)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 20px;
}

.filter-form {
  margin-bottom: 16px;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.json-detail {
  max-height: 400px;
  overflow: auto;
  margin: 0;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
