<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <span>登录日志</span>
      </template>

      <!-- Filters -->
      <el-form :model="filters" inline class="filter-form">
        <el-form-item label="用户名">
          <el-input v-model="filters.username" placeholder="请输入用户名" clearable style="width: 180px" />
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
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="loginTime" label="登录时间" width="180" />
        <el-table-column prop="ip" label="IP 地址" width="140" />
        <el-table-column prop="userAgent" label="浏览器/UA" min-width="250" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
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
import { onMounted } from 'vue'
import { adminApi } from '@/api/system/admin'
import { usePagination } from '@/composables/usePagination'
import { useTableSearch } from '@/composables/useTableSearch'

const { filters, getSearchParams, resetFilters } = useTableSearch({
  username: '',
  dateRange: null as string[] | null,
})

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange, resetPage } =
  usePagination(adminApi.loginLogs)

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
</style>
