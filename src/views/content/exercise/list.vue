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
          <el-select v-model="filters.bodyPartId" placeholder="全部" clearable style="width: 120px">
            <el-option
              v-for="item in bodyPartOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="filters.exerciseType" placeholder="全部" clearable style="width: 120px">
            <el-option label="力量" value="strength" />
            <el-option label="有氧" value="cardio" />
            <el-option label="柔韧" value="flexibility" />
            <el-option label="平衡" value="balance" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="filters.difficulty" placeholder="全部" clearable style="width: 100px">
            <el-option label="初级" value="beginner" />
            <el-option label="中级" value="intermediate" />
            <el-option label="高级" value="advanced" />
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
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="name" label="动作名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="nameEn" label="英文名" min-width="140" show-overflow-tooltip />
        <el-table-column label="示范图" width="80" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.demoImageUrl"
              :src="row.demoImageUrl"
              :preview-src-list="[row.demoImageUrl]"
              fit="cover"
              class="demo-image"
            >
              <template #error>
                <div class="image-error">-</div>
              </template>
            </el-image>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="exerciseType" label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="typeTagType(row.exerciseType)">
              {{ typeLabel(row.exerciseType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="equipment" label="器械" width="90" align="center">
          <template #default="{ row }">
            {{ equipmentLabel(row.equipment) }}
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="difficultyTagType(row.difficulty)" size="small">
              {{ difficultyLabel(row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="训练部位" min-width="150">
          <template #default="{ row }">
            <el-tag
              v-for="item in (row.bodyParts || []).slice(0, 3)"
              :key="item.id"
              size="small"
              class="muscle-tag"
            >
              {{ item.name }}
            </el-tag>
            <span v-if="(row.bodyParts || []).length > 3" class="more-tag">+{{ row.bodyParts.length - 3 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="卡路里" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.caloriesPerRep">{{ row.caloriesPerRep }}/次</span>
            <span v-else-if="row.caloriesPerMin">{{ row.caloriesPerMin }}/分钟</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="isCompound" label="复合动作" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isCompound ? 'success' : 'info'" size="small">
              {{ row.isCompound ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
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
import { ref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { exerciseApi } from '@/api/content/exercise'
import { bodyPartApi } from '@/api/content/body-part'
import { usePagination } from '@/composables/usePagination'
import { useTableSearch } from '@/composables/useTableSearch'

const router = useRouter()

const { filters, searchText, getSearchParams, resetFilters } = useTableSearch({
  bodyPartId: '' as string | number,
  exerciseType: '',
  difficulty: '',
  equipment: '',
})

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange, resetPage } =
  usePagination((params) => exerciseApi.list({ ...params, ...getSearchParams() }))

const bodyPartOptions = ref<{ id: number; name: string }[]>([])

function difficultyLabel(val: string) {
  const map: Record<string, string> = { beginner: '初级', intermediate: '中级', advanced: '高级' }
  return map[val] || '-'
}

function difficultyTagType(val: string) {
  const map: Record<string, string> = { beginner: 'success', intermediate: 'warning', advanced: 'danger' }
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

function typeTagType(val: string) {
  const map: Record<string, string> = {
    strength: 'danger',
    cardio: 'success',
    flexibility: 'warning',
    balance: 'info',
  }
  return (map[val] || 'info') as 'success' | 'warning' | 'danger' | 'info'
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
  router.push('/content/exercise/create')
}

function handleEdit(row: any) {
  router.push(`/content/exercise/edit/${row.id}`)
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

onActivated(() => {
  loadData()
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

.more-tag {
  font-size: 12px;
  color: #909399;
}

.demo-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.image-error {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 12px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
