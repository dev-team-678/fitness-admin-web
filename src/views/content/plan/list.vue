<template>
  <div class="plan-list-page">
    <!-- Filter Bar -->
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item label="关键词">
          <el-input
            v-model="searchText"
            placeholder="搜索计划名称"
            clearable
            style="width: 200px"
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="filters.difficulty" placeholder="全部" clearable style="width: 120px">
            <el-option label="初级" :value="1" />
            <el-option label="中级" :value="2" />
            <el-option label="高级" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标">
          <el-select v-model="filters.goal" placeholder="全部" clearable style="width: 140px">
            <el-option label="增肌" value="muscle_gain" />
            <el-option label="减脂" value="fat_loss" />
            <el-option label="塑形" value="toning" />
            <el-option label="力量" value="strength" />
            <el-option label="耐力" value="endurance" />
            <el-option label="灵活性" value="flexibility" />
          </el-select>
        </el-form-item>
        <el-form-item label="AI 生成">
          <el-switch v-model="filters.ai_generated" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>训练计划列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              新建计划
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="计划名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="difficulty" label="难度" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="difficultyTagType(row.difficulty)" size="small">
              {{ difficultyLabel(row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="goal" label="目标" width="90" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ goalLabel(row.goal) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="weeks" label="周数" width="70" align="center" />
        <el-table-column prop="days_per_week" label="天/周" width="70" align="center" />
        <el-table-column prop="avg_duration" label="平均时长" width="100" align="center">
          <template #default="{ row }">
            {{ row.avg_duration ? `${row.avg_duration}分钟` : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="participants" label="参与人数" width="90" align="center" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '已上架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="primary" size="small" @click="handleCopy(row)">
              复制
            </el-button>
            <el-button
              link
              :type="row.status === 1 ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-popconfirm title="确定删除该计划？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { planApi } from '@/api/content/plan'
import { usePagination } from '@/composables/usePagination'
import { useTableSearch } from '@/composables/useTableSearch'

const router = useRouter()

const { filters, searchText, getSearchParams, resetFilters } = useTableSearch({
  difficulty: '',
  goal: '',
  ai_generated: false,
})

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange, resetPage } =
  usePagination((params) => planApi.list({ ...params, ...getSearchParams() }))

function difficultyLabel(val: number) {
  const map: Record<number, string> = { 1: '初级', 2: '中级', 3: '高级' }
  return map[val] || '-'
}

function difficultyTagType(val: number) {
  const map: Record<number, string> = { 1: 'success', 2: 'warning', 3: 'danger' }
  return (map[val] || 'info') as 'success' | 'warning' | 'danger' | 'info'
}

function goalLabel(val: string) {
  const map: Record<string, string> = {
    muscle_gain: '增肌',
    fat_loss: '减脂',
    toning: '塑形',
    strength: '力量',
    endurance: '耐力',
    flexibility: '灵活性',
  }
  return map[val] || val || '-'
}

function handleSearch() {
  resetPage()
  loadData()
}

function handleReset() {
  resetFilters()
  handleSearch()
}

function handleCreate() {
  router.push('/plan/create')
}

function handleEdit(row: any) {
  router.push(`/plan/edit/${row.id}`)
}

async function handleCopy(row: any) {
  try {
    await planApi.copy(row.id)
    ElMessage.success('复制成功')
    loadData()
  } catch {
    // error handled by interceptor
  }
}

async function handleToggleStatus(row: any) {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await planApi.updateStatus(row.id, { status: newStatus })
    ElMessage.success(newStatus === 1 ? '已上架' : '已下架')
    loadData()
  } catch {
    // error handled by interceptor
  }
}

async function handleDelete(row: any) {
  try {
    await planApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // error handled by interceptor
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.plan-list-page {
  padding: 16px;
}

.filter-card {
  margin-bottom: 16px;
}

.table-card {
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
