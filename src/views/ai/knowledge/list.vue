<template>
  <div class="knowledge-list-page">
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filters" @submit.prevent="handleSearch">
        <el-form-item label="关键词">
          <el-input v-model="searchText" placeholder="搜索标题/内容" clearable @clear="handleSearch" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="filters.category" placeholder="全部" clearable @change="handleSearch">
            <el-option v-for="cat in categories" :key="cat.code" :label="cat.name" :value="cat.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="向量状态">
          <el-select v-model="filters.vectorStatus" placeholder="全部" clearable @change="handleSearch">
            <el-option label="待处理" value="pending" />
            <el-option label="索引中" value="indexing" />
            <el-option label="已索引" value="indexed" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>知识库列表</span>
          <div>
            <el-button type="primary" @click="handleBatchImport">
              <el-icon><Upload /></el-icon>
              批量导入
            </el-button>
            <el-button @click="handleAdd">新增知识</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="tags" label="标签" width="200">
          <template #default="{ row }">
            <template v-if="parseTags(row.tags).length">
              <el-tag v-for="tag in parseTags(row.tags)" :key="tag" size="small" class="tag-item">{{ tag }}</el-tag>
            </template>
            <span v-else style="color: #c0c4cc">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="vectorStatus" label="向量状态" width="100">
          <template #default="{ row }">
            <el-tag :type="vectorStatusType(row.vectorStatus)" size="small">
              {{ vectorStatusText(row.vectorStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button
              v-if="row.vectorStatus === 'failed'"
              link
              type="warning"
              @click="handleRetryVectorize(row)"
            >
              重试向量化
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </el-card>

    <input ref="fileInputRef" type="file" accept=".json,.csv,.xlsx" style="display: none" @change="onFileSelected" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { knowledgeApi } from '@/api/ai/knowledge'
import { usePagination } from '@/composables/usePagination'
import { useTableSearch } from '@/composables/useTableSearch'

const router = useRouter()
const fileInputRef = ref<HTMLInputElement>()
interface Category {
  id: number
  code: string
  name: string
}
const categories = ref<Category[]>([])

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange, resetPage } =
  usePagination(knowledgeApi.list)

const { filters, searchText, getSearchParams, resetFilters } = useTableSearch({
  category: '',
  vectorStatus: '',
})

function parseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string' && tags.trim()) {
    try {
      const parsed = JSON.parse(tags)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function vectorStatusType(status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined> = {
    pending: 'warning',
    indexing: undefined,
    indexed: 'success',
    failed: 'danger',
  }
  return map[status] || 'info'
}

function vectorStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待处理',
    indexing: '索引中',
    indexed: '已索引',
    failed: '失败',
  }
  return map[status] || status
}

function handleSearch() {
  resetPage()
  loadData(getSearchParams())
}

function handleReset() {
  resetFilters()
  handleSearch()
}

function handleAdd() {
  router.push('/ai/knowledge/create')
}

function handleEdit(row: { id: number }) {
  router.push(`/ai/knowledge/edit/${row.id}`)
}

async function handleDelete(row: { id: number; title: string }) {
  await ElMessageBox.confirm(`确认删除知识「${row.title}」？`, '提示', { type: 'warning' })
  await knowledgeApi.delete(row.id)
  ElMessage.success('删除成功')
  loadData(getSearchParams())
}

async function handleRetryVectorize(row: { id: number }) {
  await knowledgeApi.retryVectorize(row.id)
  ElMessage.success('已重新提交向量化任务')
  loadData(getSearchParams())
}

function handleBatchImport() {
  fileInputRef.value?.click()
}

async function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    await knowledgeApi.batchImport(file)
    ElMessage.success('批量导入已提交')
    loadData(getSearchParams())
  } catch {
    ElMessage.error('导入失败')
  } finally {
    input.value = ''
  }
}

async function loadCategories() {
  const res = await knowledgeApi.getCategories()
  categories.value = res.data || []
}

onMounted(() => {
  loadData()
  loadCategories()
})
</script>

<style lang="scss" scoped>
.knowledge-list-page {
  padding: 16px;
}

.filter-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tag-item {
  margin-right: 4px;
  margin-bottom: 4px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
