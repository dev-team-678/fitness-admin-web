<template>
  <div class="community-comments">
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="用户 ID">
          <el-input v-model="filters.userId" placeholder="请输入用户 ID" clearable />
        </el-form-item>
        <el-form-item label="帖子 ID">
          <el-input v-model="filters.postId" placeholder="请输入帖子 ID" clearable />
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
        <el-table-column prop="content" label="评论内容" min-width="250" show-overflow-tooltip />
        <el-table-column prop="userId" label="用户 ID" width="100" />
        <el-table-column prop="postId" label="所属帖子" width="100">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewPost(row)">#{{ row.postId }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="评论时间" width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { commentApi } from '@/api/community/comment'
import { usePagination } from '@/composables/usePagination'
import { useTableSearch } from '@/composables/useTableSearch'

const router = useRouter()

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange, resetPage } =
  usePagination(commentApi.list as (params: Record<string, unknown>) => Promise<unknown>)

const { filters, getSearchParams, resetFilters } = useTableSearch({
  userId: '',
  postId: '',
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

function handleViewPost(row: Record<string, unknown>) {
  router.push({ path: '/community/posts', query: { postId: String(row.postId) } })
}

async function handleDelete(row: Record<string, unknown>) {
  try {
    await ElMessageBox.confirm('确定要删除该条评论吗？此操作不可恢复。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await commentApi.delete(row.id as number)
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
.community-comments {
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
