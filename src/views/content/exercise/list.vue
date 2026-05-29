<template>
  <div class="exercise-list-page">
    <!-- Filter Bar -->
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item label="关键词">
          <el-input
            v-model="searchText"
            placeholder="搜索动作名称"
            clearable
            style="width: 180px"
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="部位">
          <el-select v-model="filters.body_part_id" placeholder="全部" clearable style="width: 120px">
            <el-option
              v-for="item in bodyPartOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="filters.type" placeholder="全部" clearable style="width: 120px">
            <el-option label="力量" value="strength" />
            <el-option label="有氧" value="cardio" />
            <el-option label="柔韧" value="flexibility" />
            <el-option label="平衡" value="balance" />
            <el-option label="复合" value="compound" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="filters.difficulty" placeholder="全部" clearable style="width: 100px">
            <el-option label="初级" :value="1" />
            <el-option label="中级" :value="2" />
            <el-option label="高级" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="器械">
          <el-select v-model="filters.equipment" placeholder="全部" clearable style="width: 120px">
            <el-option label="无器械" value="none" />
            <el-option label="哑铃" value="dumbbell" />
            <el-option label="杠铃" value="barbell" />
            <el-option label="固定器械" value="machine" />
            <el-option label="弹力带" value="band" />
            <el-option label="其他" value="other" />
          </el-select>
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
          <span>动作列表</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新增动作
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="动作名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="name_en" label="英文名" min-width="140" show-overflow-tooltip />
        <el-table-column prop="category_name" label="分类" width="100" show-overflow-tooltip />
        <el-table-column prop="difficulty" label="难度" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="difficultyTagType(row.difficulty)" size="small">
              {{ difficultyLabel(row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="80" align="center">
          <template #default="{ row }">
            {{ typeLabel(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="equipment" label="器械" width="90" align="center">
          <template #default="{ row }">
            {{ equipmentLabel(row.equipment) }}
          </template>
        </el-table-column>
        <el-table-column prop="target_muscles" label="目标肌群" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag
              v-for="m in (row.target_muscles || []).slice(0, 3)"
              :key="m"
              size="small"
              class="muscle-tag"
            >
              {{ m }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-popconfirm title="确定删除该动作？" @confirm="handleDelete(row)">
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { exerciseApi } from '@/api/content/exercise'
import { bodyPartApi } from '@/api/content/body-part'
import { usePagination } from '@/composables/usePagination'
import { useTableSearch } from '@/composables/useTableSearch'

const router = useRouter()

const { filters, searchText, getSearchParams, resetFilters } = useTableSearch({
  body_part_id: '',
  type: '',
  difficulty: '',
  equipment: '',
})

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange, resetPage } =
  usePagination((params) => exerciseApi.list({ ...params, ...getSearchParams() }))

const bodyPartOptions = ref<{ id: number; name: string }[]>([])

function difficultyLabel(val: number) {
  const map: Record<number, string> = { 1: '初级', 2: '中级', 3: '高级' }
  return map[val] || '-'
}

function difficultyTagType(val: number) {
  const map: Record<number, string> = { 1: 'success', 2: 'warning', 3: 'danger' }
  return (map[val] || 'info') as 'success' | 'warning' | 'danger' | 'info'
}

function typeLabel(val: string) {
  const map: Record<string, string> = {
    strength: '力量',
    cardio: '有氧',
    flexibility: '柔韧',
    balance: '平衡',
    compound: '复合',
  }
  return map[val] || val || '-'
}

function equipmentLabel(val: string) {
  const map: Record<string, string> = {
    none: '无器械',
    dumbbell: '哑铃',
    barbell: '杠铃',
    machine: '固定器械',
    band: '弹力带',
    other: '其他',
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
  router.push('/exercise/create')
}

function handleEdit(row: any) {
  router.push(`/exercise/edit/${row.id}`)
}

async function handleDelete(row: any) {
  try {
    await exerciseApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // error handled by interceptor
  }
}

async function loadBodyParts() {
  try {
    const res = await bodyPartApi.list() as any
    bodyPartOptions.value = res.data || []
  } catch {
    // ignore
  }
}

onMounted(() => {
  loadData()
  loadBodyParts()
})
</script>

<style lang="scss" scoped>
.exercise-list-page {
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

.muscle-tag {
  margin-right: 4px;
  margin-bottom: 2px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
