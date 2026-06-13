<template>
  <div class="community-posts">
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="正常" :value="1" />
            <el-option label="已隐藏" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="帖子 ID">
          <el-input v-model="filters.id" placeholder="请输入帖子 ID" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="用户 ID">
          <el-input v-model="filters.userId" placeholder="请输入用户 ID" clearable style="width: 160px" />
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

    <el-card v-if="highlightedPost" shadow="never" class="highlight-card">
      <div class="highlight-content">
        <span class="highlight-label">已定位到帖子 #{{ highlightedPost.id }}</span>
        <span class="highlight-text" v-if="highlightedPost.content">{{ highlightedPost.content }}</span>
        <el-button type="danger" link size="small" @click="clearHighlight">清除定位</el-button>
      </div>
    </el-card>

    <el-card shadow="never">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        border
        :row-class-name="rowClassName"
        highlight-current-row
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="content" label="内容" min-width="220" show-overflow-tooltip />
        <el-table-column prop="userId" label="用户 ID" width="100" />
        <el-table-column prop="images" label="图片" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.images && row.images.length > 0"
              :src="row.images[0]"
              style="width: 48px; height: 48px"
              fit="cover"
              :preview-src-list="row.images"
              preview-teleported
            />
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="likeCount" label="点赞" width="70" sortable />
        <el-table-column prop="commentCount" label="评论" width="70" sortable />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTagType[row.status as number]" size="small">
              {{ statusMap[row.status as number] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="帖子 ID" width="90" />
        <el-table-column prop="createdAt" label="发布时间" width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              type="success"
              link
              size="small"
              @click="handleApprove(row)"
            >
              恢复
            </el-button>
            <el-button
              v-if="row.status === 1"
              type="warning"
              link
              size="small"
              @click="handleHide(row)"
            >
              隐藏
            </el-button>
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
import { ref, onMounted, onActivated, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { postApi } from '@/api/community/post'
import { usePagination } from '@/composables/usePagination'
import { useTableSearch } from '@/composables/useTableSearch'

const statusMap: Record<number, string> = {
  0: '已隐藏',
  1: '正常',
}

const statusTagType: Record<number, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
  0: 'danger',
  1: 'success',
}

const route = useRoute()
const router = useRouter()
const highlightedPostId = ref<number | null>(null)
const highlightedPost = ref<Record<string, unknown> | null>(null)

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange, resetPage } =
  usePagination(postApi.list as (params: Record<string, unknown>) => Promise<unknown>)

const { filters, getSearchParams, resetFilters } = useTableSearch({
  status: '' as number | string,
  id: '',
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
  highlightedPostId.value = null
  highlightedPost.value = null
  if (route.query.postId) {
    router.replace({ path: route.path, query: {} })
  }
  resetPage()
  loadData()
}

function rowClassName({ row }: { row: Record<string, unknown> }) {
  return highlightedPostId.value && row.id === highlightedPostId.value ? 'highlighted-row' : ''
}

function clearHighlight() {
  highlightedPostId.value = null
  highlightedPost.value = null
  if (route.query.postId) {
    router.replace({ path: route.path, query: {} })
  }
}

async function applyHighlight() {
  const queryPostId = route.query.postId
  if (!queryPostId) return
  const postId = Number(queryPostId)
  if (!postId || Number.isNaN(postId)) return
  highlightedPostId.value = postId
  filters.id = String(postId)
  try {
    const res = (await postApi.detail(postId)) as { data?: Record<string, unknown> }
    if (res?.data) {
      highlightedPost.value = res.data
    }
  } catch {
    highlightedPost.value = { id: postId, content: '（帖子已被删除或不可见）' }
  }
  loadData(buildParams())
}

watch(() => route.query.postId, () => {
  applyHighlight()
})

onMounted(() => {
  applyHighlight()
})

onActivated(() => {
  if (route.query.postId) {
    applyHighlight()
  }
})

async function handleApprove(row: Record<string, unknown>) {
  try {
    await ElMessageBox.confirm('确定恢复该帖子为正常状态？', '恢复帖子', { type: 'warning' })
    await postApi.updateStatus(row.id as number, { status: 1 })
    ElMessage.success('已恢复')
    loadData(buildParams())
  } catch { /* cancelled */ }
}

async function handleHide(row: Record<string, unknown>) {
  try {
    await ElMessageBox.confirm('确定隐藏该帖子？隐藏后用户不可见。', '隐藏帖子', { type: 'warning' })
    await postApi.updateStatus(row.id as number, { status: 0 })
    ElMessage.success('已隐藏')
    loadData(buildParams())
  } catch { /* cancelled */ }
}

async function handleDelete(row: Record<string, unknown>) {
  try {
    await ElMessageBox.confirm('确定删除该帖子？此操作不可恢复。', '删除帖子', { type: 'error' })
    await postApi.delete(row.id as number)
    ElMessage.success('已删除')
    loadData(buildParams())
  } catch { /* cancelled */ }
}
</script>

<style lang="scss" scoped>
.community-posts {
  padding: 16px;
}

.filter-card {
  margin-bottom: 16px;
}

.highlight-card {
  margin-bottom: 16px;
  background: #fdf6ec;
  border: 1px solid #faecd8;

  .highlight-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .highlight-label {
    font-weight: 600;
    color: #e6a23c;
  }

  .highlight-text {
    flex: 1;
    color: #606266;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

:deep(.highlighted-row) {
  background: #fdf6ec !important;

  td {
    background: #fdf6ec !important;
  }
}
</style>
