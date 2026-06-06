<template>
  <div class="achievement-list">
    <el-card shadow="never" class="filter-card">
      <div class="filter-header">
        <el-form :inline="true">
          <el-form-item label="名称">
            <el-input v-model="filters.name" placeholder="请输入成就名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        <el-button type="success" @click="handleAdd">新增成就</el-button>
      </div>
    </el-card>

    <el-card shadow="never">
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="name" label="成就名称" min-width="140" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="iconUrl" label="图标" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.iconUrl"
              :src="row.iconUrl"
              style="width: 32px; height: 32px"
              fit="contain"
            />
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="conditionType" label="条件类型" width="120">
          <template #default="{ row }">
            {{ conditionTypeMap[row.conditionType as string] || row.conditionType }}
          </template>
        </el-table-column>
        <el-table-column prop="conditionValue" label="条件值" width="100" />
        <el-table-column prop="badgeColor" label="徽章颜色" width="100">
          <template #default="{ row }">
            <el-color-picker v-model="row.badgeColor" size="small" disabled />
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="80" sortable />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
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
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { achievementApi } from '@/api/achievement/achievement'
import { usePagination } from '@/composables/usePagination'
import { useTableSearch } from '@/composables/useTableSearch'

const router = useRouter()

const conditionTypeMap: Record<string, string> = {
  workout_count: '训练次数',
  total_volume: '总训练量',
  consecutive_days: '连续打卡天数',
  checkin_count: '签到次数',
  plan_completed: '完成计划数',
}

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange, resetPage } =
  usePagination(achievementApi.list as (params: Record<string, unknown>) => Promise<unknown>)

const { filters, getSearchParams, resetFilters } = useTableSearch({
  name: '',
})

function handleSearch() {
  resetPage()
  loadData(getSearchParams())
}

function handleReset() {
  resetFilters()
  resetPage()
  loadData()
}

function handleAdd() {
  router.push('/achievement/edit')
}

function handleEdit(row: Record<string, unknown>) {
  router.push(`/achievement/edit/${row.id}`)
}

async function handleDelete(row: Record<string, unknown>) {
  try {
    await ElMessageBox.confirm(`确定要删除成就「${row.name}」吗？此操作不可恢复。`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await achievementApi.delete(row.id as number)
    ElMessage.success('删除成功')
    loadData(getSearchParams())
  } catch {
    // cancelled or error
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.achievement-list {
  padding: 16px;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
