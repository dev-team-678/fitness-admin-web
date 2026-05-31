<template>
  <div class="community-reports">
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="待处理" value="pending" />
            <el-option label="已处理" value="resolved" />
            <el-option label="已驳回" value="dismissed" />
          </el-select>
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
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="reporterId" label="举报人 ID" width="100" />
        <el-table-column prop="targetType" label="举报目标" width="90">
          <template #default="{ row }">
            {{ targetTypeMap[row.targetType as string] || row.targetType }}
          </template>
        </el-table-column>
        <el-table-column prop="targetId" label="目标 ID" width="90" />
        <el-table-column prop="reason" label="举报原因" min-width="160" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="举报时间" width="160" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTagType[row.status as string]" size="small">
              {{ statusMap[row.status as string] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button type="success" link size="small" @click="handleConfirm(row)">确认违规</el-button>
              <el-button type="info" link size="small" @click="handleDismiss(row)">驳回</el-button>
            </template>
            <el-button
              v-if="row.status !== 'pending'"
              type="warning"
              link
              size="small"
              @click="handleMute(row)"
            >
              禁言用户
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

    <!-- Mute Dialog -->
    <el-dialog v-model="muteDialogVisible" title="禁言用户" width="420px" destroy-on-close>
      <el-form :model="muteForm" label-width="80px">
        <el-form-item label="禁言时长">
          <el-select v-model="muteForm.duration" style="width: 100%">
            <el-option label="1 天" :value="1" />
            <el-option label="3 天" :value="3" />
            <el-option label="7 天" :value="7" />
            <el-option label="30 天" :value="30" />
            <el-option label="永久" :value="-1" />
          </el-select>
        </el-form-item>
        <el-form-item label="禁言原因">
          <el-input v-model="muteForm.reason" type="textarea" :rows="3" placeholder="请输入禁言原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="muteDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="muteLoading" @click="submitMute">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reportApi } from '@/api/community/report'
import { usePagination } from '@/composables/usePagination'
import { useTableSearch } from '@/composables/useTableSearch'

const statusMap: Record<string, string> = {
  pending: '待处理',
  resolved: '已处理',
  dismissed: '已驳回',
}

const statusTagType: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
  pending: 'warning',
  resolved: 'success',
  dismissed: 'info',
}

const targetTypeMap: Record<string, string> = {
  post: '帖子',
  comment: '评论',
}

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange, resetPage } =
  usePagination(reportApi.list as (params: Record<string, unknown>) => Promise<unknown>)

const { filters, getSearchParams, resetFilters } = useTableSearch({
  status: '' as number | string,
})

const dateRange = ref<[string, string] | null>(null)

// Mute dialog state
const muteDialogVisible = ref(false)
const muteLoading = ref(false)
const currentMuteTarget = ref<Record<string, unknown>>({})
const muteForm = reactive({
  duration: 3,
  reason: '',
})

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

async function handleConfirm(row: Record<string, unknown>) {
  try {
    await ElMessageBox.confirm('确认该内容存在违规？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await reportApi.handle(row.id as number, { result: 'confirmed' })
    ElMessage.success('已处理')
    loadData(buildParams())
  } catch {
    // cancelled or error
  }
}

async function handleDismiss(row: Record<string, unknown>) {
  try {
    await reportApi.handle(row.id as number, { result: 'dismissed' })
    ElMessage.success('已驳回')
    loadData(buildParams())
  } catch {
    // handled by interceptor
  }
}

function handleMute(row: Record<string, unknown>) {
  currentMuteTarget.value = row
  muteForm.duration = 3
  muteForm.reason = ''
  muteDialogVisible.value = true
}

async function submitMute() {
  if (!muteForm.reason.trim()) {
    ElMessage.warning('请输入禁言原因')
    return
  }
  muteLoading.value = true
  try {
    const userId = currentMuteTarget.value.reporterId as number
    await reportApi.muteUser(userId, {
      duration: muteForm.duration,
      reason: muteForm.reason,
    })
    ElMessage.success('禁言成功')
    muteDialogVisible.value = false
    loadData(buildParams())
  } catch {
    // handled by interceptor
  } finally {
    muteLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.community-reports {
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
