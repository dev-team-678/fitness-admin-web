<template>
  <div class="user-list-page">
    <!-- Search Bar -->
    <el-card shadow="never" class="search-card">
      <el-form :model="filters" inline @submit.prevent="handleSearch">
        <el-form-item label="关键词">
          <el-input
            v-model="searchText"
            placeholder="昵称 / OpenID / 用户ID"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="filters.gender" placeholder="全部" clearable style="width: 120px">
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
            <el-option label="未知" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="健身目标">
          <el-select v-model="filters.fitnessGoal" placeholder="全部" clearable style="width: 140px">
            <el-option
              v-for="item in goalOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="健身水平">
          <el-select v-model="filters.fitnessLevel" placeholder="全部" clearable style="width: 120px">
            <el-option
              v-for="item in levelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="正常" :value="1" />
            <el-option label="已禁用" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="注册时间">
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
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Data Table -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="id" label="用户ID" width="90" align="center" />
        <el-table-column prop="nickname" label="昵称" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="nickname-cell">
              <el-avatar
                v-if="row.avatarUrl"
                :src="row.avatarUrl"
                :size="32"
                class="nickname-avatar"
              />
              <span>{{ row.nickname || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="头像" width="80" align="center">
          <template #default="{ row }">
            <el-avatar v-if="row.avatarUrl" :src="row.avatarUrl" :size="40" />
            <el-avatar v-else :size="40">
              <el-icon :size="20"><User /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="性别" width="80" align="center">
          <template #default="{ row }">
            <span v-if="row.gender === 1">男</span>
            <span v-else-if="row.gender === 2">女</span>
            <span v-else class="text-muted">未知</span>
          </template>
        </el-table-column>
        <el-table-column prop="fitnessGoal" label="健身目标" width="120" align="center">
          <template #default="{ row }">
            <span>{{ formatGoal(row.fitnessGoal) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fitnessLevel" label="健身水平" width="100" align="center">
          <template #default="{ row }">
            <span>{{ formatLevel(row.fitnessLevel) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="170" align="center" sortable />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="light">
              {{ row.status === 1 ? '正常' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="goDetail(row.id)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button
              link
              :type="row.status === 1 ? 'danger' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
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
          background
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- Edit Dialog -->
    <el-dialog v-model="editVisible" title="编辑用户" width="600px" destroy-on-close>
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="editForm.gender">
            <el-radio :value="0">未知</el-radio>
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker
            v-model="editForm.birthday"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="身高(cm)">
              <el-input-number v-model="editForm.heightCm" :min="50" :max="250" :precision="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="体重(kg)">
              <el-input-number v-model="editForm.currentWeightKg" :min="20" :max="300" :precision="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="目标体重(kg)">
          <el-input-number v-model="editForm.targetWeightKg" :min="20" :max="300" :precision="1" style="width: 200px" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="健身目标">
              <el-select v-model="editForm.fitnessGoal" placeholder="请选择" clearable style="width: 100%">
                <el-option v-for="item in goalOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="健身水平">
              <el-select v-model="editForm.fitnessLevel" placeholder="请选择" clearable style="width: 100%">
                <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="每周训练(天)">
              <el-input-number v-model="editForm.workoutDaysPerWeek" :min="1" :max="7" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单次时长(分)">
              <el-input-number v-model="editForm.workoutDurationMin" :min="10" :max="180" :step="5" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="标签">
          <el-checkbox-group v-model="editForm.tagIds">
            <el-checkbox v-for="tag in allTags" :key="tag.id" :value="tag.id">
              {{ tag.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="handleEditSubmit">保存</el-button>
      </template>
    </el-dialog>

    <!-- Batch Action Bar -->
    <transition name="slide-up">
      <div v-if="selectedRows.length > 0" class="batch-bar">
        <span class="batch-count">已选 {{ selectedRows.length }} 人</span>
        <el-button type="danger" :loading="batchLoading" @click="handleBatchStatus(2)">
          批量禁用
        </el-button>
        <el-button type="success" :loading="batchLoading" @click="handleBatchStatus(1)">
          批量启用
        </el-button>
        <el-button text @click="clearSelection">取消选择</el-button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Search, Refresh, User } from '@element-plus/icons-vue'
import { userApi } from '@/api/user/user'
import { usePagination } from '@/composables/usePagination'
import { useTableSearch } from '@/composables/useTableSearch'

const router = useRouter()

// Search filters
const { filters, searchText, getSearchParams, resetFilters } = useTableSearch({
  gender: null as number | null,
  fitnessGoal: '' as string,
  fitnessLevel: '' as string,
  status: null as number | null,
  dateRange: null as [string, string] | null,
})

// Pagination
const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange, resetPage } =
  usePagination(async (params) => {
    const searchParams = getSearchParams()
    // Flatten dateRange into start_date / end_date
    const { dateRange, ...rest } = searchParams
    const extra: Record<string, unknown> = { ...rest }
    if (dateRange && Array.isArray(dateRange)) {
      extra.startDate = dateRange[0]
      extra.endDate = dateRange[1]
    }
    const res = await userApi.list({ ...params, ...extra })
    return res
  })

// Selection
const selectedRows = ref<any[]>([])
const batchLoading = ref(false)

// Filter options
const goalOptions = [
  { label: '减脂', value: 'lose_fat' },
  { label: '增肌', value: 'gain_muscle' },
  { label: '保持健康', value: 'keep_fit' },
  { label: '提升耐力', value: 'improve_endurance' },
]

const levelOptions = [
  { label: '初学者', value: 'beginner' },
  { label: '进阶', value: 'intermediate' },
  { label: '高级', value: 'advanced' },
]

const goalMap: Record<string, string> = {
  lose_fat: '减脂',
  gain_muscle: '增肌',
  keep_fit: '保持健康',
  improve_endurance: '提升耐力',
}

const levelMap: Record<string, string> = {
  beginner: '初学者',
  intermediate: '进阶',
  advanced: '高级',
}

function formatGoal(goal: string) {
  return goalMap[goal] || goal || '-'
}

function formatLevel(level: string) {
  return levelMap[level] || level || '-'
}

// Edit dialog
const editVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref<FormInstance>()
const allTags = ref<any[]>([])

const editForm = reactive({
  id: 0,
  nickname: '',
  gender: 0,
  birthday: '',
  heightCm: null as number | null,
  currentWeightKg: null as number | null,
  targetWeightKg: null as number | null,
  fitnessGoal: '',
  fitnessLevel: '',
  workoutDaysPerWeek: null as number | null,
  workoutDurationMin: null as number | null,
  tagIds: [] as number[],
})

const editRules: FormRules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
}

function handleEdit(row: any) {
  editForm.id = row.id
  editForm.nickname = row.nickname || ''
  editForm.gender = row.gender ?? 0
  editForm.birthday = row.birthday || ''
  editForm.heightCm = row.heightCm ?? null
  editForm.currentWeightKg = row.currentWeightKg ?? null
  editForm.targetWeightKg = row.targetWeightKg ?? null
  editForm.fitnessGoal = row.fitnessGoal || ''
  editForm.fitnessLevel = row.fitnessLevel || ''
  editForm.workoutDaysPerWeek = row.workoutDaysPerWeek ?? null
  editForm.workoutDurationMin = row.workoutDurationMin ?? null
  editForm.tagIds = (row.tags || []).map((t: any) => t.id)
  editVisible.value = true
}

async function handleEditSubmit() {
  const valid = await editFormRef.value?.validate().catch(() => false)
  if (!valid) return
  editLoading.value = true
  try {
    await userApi.update({ ...editForm })
    ElMessage.success('保存成功')
    editVisible.value = false
    loadData()
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    editLoading.value = false
  }
}

async function loadTags() {
  try {
    const res = await userApi.tags()
    allTags.value = (res as any).data || res || []
  } catch {
    // ignore
  }
}

// Actions
function handleSearch() {
  resetPage()
  loadData()
}

function handleReset() {
  resetFilters()
  resetPage()
  loadData()
}

function handleSelectionChange(rows: any[]) {
  selectedRows.value = rows
}

function clearSelection() {
  selectedRows.value = []
}

function goDetail(id: number) {
  router.push(`/user/detail/${id}`)
}

async function handleToggleStatus(row: any) {
  const newStatus = row.status === 1 ? 2 : 1
  const actionText = newStatus === 2 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${actionText}用户「${row.nickname || row.id}」吗？`, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await userApi.updateStatus(row.id, { status: newStatus })
    ElMessage.success(`已${actionText}`)
    loadData()
  } catch {
    // user cancelled or request failed
  }
}

async function handleBatchStatus(status: number) {
  const actionText = status === 2 ? '禁用' : '启用'
  const ids = selectedRows.value.map((r) => r.id)
  try {
    await ElMessageBox.confirm(
      `确定要${actionText}选中的 ${ids.length} 名用户吗？`,
      '批量操作',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
    )
    batchLoading.value = true
    await userApi.batchStatus({ user_ids: ids, status })
    ElMessage.success(`已批量${actionText}`)
    selectedRows.value = []
    loadData()
  } catch {
    // cancelled
  } finally {
    batchLoading.value = false
  }
}

// Initial load
onMounted(() => {
  loadTags()
})
loadData()
</script>

<style lang="scss" scoped>
.user-list-page {
  padding: 16px;
}

.search-card {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 80px;
}

.nickname-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nickname-avatar {
  flex-shrink: 0;
}

.text-muted {
  color: #c0c4cc;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.batch-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: #fff;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
  border-top: 1px solid #ebeef5;
}

.batch-count {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
