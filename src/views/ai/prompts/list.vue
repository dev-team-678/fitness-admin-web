<template>
  <div class="prompts-list-page">
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>提示词模板管理</span>
          <el-button type="primary" @click="handleAdd">新增模板</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="name" label="模板名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="version" label="当前版本" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">v{{ row.version }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="最后更新" width="180" />
        <el-table-column prop="isActive" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isActive === 1 ? 'success' : 'info'" size="small">
              {{ row.isActive === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="warning" @click="handleViewVersions(row)">版本历史</el-button>
            <el-button link type="danger" @click="handleRollback(row)">回滚</el-button>
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

    <el-dialog v-model="versionsDialogVisible" title="版本历史" width="640px">
      <el-timeline v-if="versions.length > 0">
        <el-timeline-item
          v-for="v in versions"
          :key="v.version"
          :timestamp="v.createdAt"
          :type="v.version === currentVersion ? 'primary' : ''"
          placement="top"
        >
          <el-card shadow="never" class="version-card">
            <div class="version-header">
              <el-tag :type="v.version === currentVersion ? 'primary' : 'info'" size="small">
                v{{ v.version }}
                <span v-if="v.version === currentVersion"> (当前)</span>
              </el-tag>
              <span class="version-author">{{ v.createdBy }}</span>
            </div>
            <div class="version-preview">{{ v.contentPreview }}</div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无版本记录" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { promptApi } from '@/api/ai/prompt'
import { usePagination } from '@/composables/usePagination'

interface Version {
  version: number
  contentPreview: string
  createdBy: string
  createdAt: string
}

const router = useRouter()

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange } =
  usePagination(promptApi.list)

const versionsDialogVisible = ref(false)
const versions = ref<Version[]>([])
const currentVersion = ref(0)
const selectedPromptId = ref(0)

function handleAdd() {
  router.push('/ai/safety/prompts/edit/0')
}

function handleEdit(row: { id: number }) {
  router.push(`/ai/safety/prompts/edit/${row.id}`)
}

async function handleViewVersions(row: { id: number; version: number }) {
  selectedPromptId.value = row.id
  currentVersion.value = row.version
  versionsDialogVisible.value = true
  const res = await promptApi.versions(row.id)
  versions.value = res.data || []
}

async function handleRollback(row: { id: number; name: string }) {
  await ElMessageBox.confirm(
    `确认回滚模板「${row.name}」到上一版本？`,
    '提示',
    { type: 'warning' }
  )
  await promptApi.rollback(row.id)
  ElMessage.success('回滚成功')
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.prompts-list-page {
  padding: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.version-card {
  margin-bottom: 0;
}

.version-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.version-author {
  font-size: 13px;
  color: #909399;
}

.version-preview {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
