<template>
  <div class="body-metric">
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="用户 ID">
          <el-input v-model="filters.userId" placeholder="请输入用户 ID" clearable />
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
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="userId" label="用户 ID" width="100" />
        <el-table-column prop="recordDate" label="记录日期" width="120" />
        <el-table-column prop="weightKg" label="体重 (kg)" width="100" sortable />
        <el-table-column prop="bodyFatPct" label="体脂率 (%)" width="110" sortable>
          <template #default="{ row }">
            {{ row.bodyFatPct != null ? row.bodyFatPct.toFixed(1) + '%' : '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="chestCm" label="胸围 (cm)" width="100" />
        <el-table-column prop="waistCm" label="腰围 (cm)" width="100" />
        <el-table-column prop="hipCm" label="臀围 (cm)" width="100" />
        <el-table-column label="臂围 (cm)" width="120">
          <template #default="{ row }">
            <span v-if="row.leftArmCm">左{{ row.leftArmCm }}</span>
            <span v-if="row.leftArmCm && row.rightArmCm"> / </span>
            <span v-if="row.rightArmCm">右{{ row.rightArmCm }}</span>
            <span v-if="!row.leftArmCm && !row.rightArmCm">--</span>
          </template>
        </el-table-column>
        <el-table-column label="大腿围 (cm)" width="130">
          <template #default="{ row }">
            <span v-if="row.leftThighCm">左{{ row.leftThighCm }}</span>
            <span v-if="row.leftThighCm && row.rightThighCm"> / </span>
            <span v-if="row.rightThighCm">右{{ row.rightThighCm }}</span>
            <span v-if="!row.leftThighCm && !row.rightThighCm">--</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button
              type="danger"
              link
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { bodyMetricApi } from '@/api/workout/body-metric'
import { usePagination } from '@/composables/usePagination'
import { useTableSearch } from '@/composables/useTableSearch'

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange, resetPage } =
  usePagination(bodyMetricApi.list as (params: Record<string, unknown>) => Promise<unknown>)

const { filters, getSearchParams, resetFilters } = useTableSearch({
  userId: '',
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

async function handleDelete(row: Record<string, unknown>) {
  try {
    await ElMessageBox.confirm('确定要删除该条体测记录吗？此操作不可恢复。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await bodyMetricApi.delete(row.id as number)
    ElMessage.success('删除成功')
    loadData(buildParams())
  } catch {
    // cancelled or error
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.body-metric {
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
