<template>
  <div class="safety-list-page">
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>安全规则管理</span>
          <div>
            <el-button type="primary" @click="handleAdd">新增规则</el-button>
            <el-button @click="openTestDialog">测试规则</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="ruleType" label="规则类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ ruleTypeText(row.ruleType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="matchMode" label="匹配模式" width="100">
          <template #default="{ row }">
            <el-tag :type="row.matchMode === 'regex' ? 'warning' : undefined" size="small">
              {{ row.matchMode === 'regex' ? '正则' : '关键词' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pattern" label="匹配规则" min-width="200" show-overflow-tooltip />
        <el-table-column prop="action" label="处置动作" width="100">
          <template #default="{ row }">
            <el-tag :type="actionType(row.action)" size="small">{{ actionText(row.action) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80" align="center" />
        <el-table-column prop="enabled" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" @change="handleToggle(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
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

    <el-dialog v-model="testDialogVisible" title="规则测试" width="520px">
      <el-form label-width="80px">
        <el-form-item label="测试文本">
          <el-input
            v-model="testText"
            type="textarea"
            :rows="4"
            placeholder="输入文本测试是否命中规则"
          />
        </el-form-item>
      </el-form>
      <div v-if="testResult" class="test-result">
        <el-alert
          :type="testResult.matched ? 'warning' : 'success'"
          :title="testResult.matched ? '命中规则' : '未命中任何规则'"
          :description="testResult.matched ? `命中规则: ${testResult.ruleName}，处置: ${actionText(testResult.action || '')}` : ''"
          show-icon
          :closable="false"
        />
      </div>
      <template #footer>
        <el-button @click="testDialogVisible = false">关闭</el-button>
        <el-button type="primary" :loading="testLoading" @click="handleTest">测试</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safetyApi } from '@/api/ai/safety'
import { usePagination } from '@/composables/usePagination'

const router = useRouter()

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange } =
  usePagination(safetyApi.rules)

const testDialogVisible = ref(false)
const testText = ref('')
const testLoading = ref(false)
const testResult = ref<{ matched: boolean; ruleName?: string; action?: string } | null>(null)

function ruleTypeText(type: string) {
  const map: Record<string, string> = {
    sensitive: '敏感词',
    prohibited: '违禁词',
    medical: '医疗限制',
    disclaimer: '免责声明',
  }
  return map[type] || type
}

function actionType(action: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined> = {
    block: 'danger',
    warn: 'warning',
    filter: 'info',
    disclaimer: undefined,
  }
  return map[action] || 'info'
}

function actionText(action: string) {
  const map: Record<string, string> = {
    block: '拦截',
    warn: '警告',
    filter: '过滤',
    disclaimer: '免责声明',
  }
  return map[action] || action
}

function handleAdd() {
  router.push('/ai/safety/create')
}

function handleEdit(row: { id: number }) {
  router.push(`/ai/safety/edit/${row.id}`)
}

async function handleDelete(row: { id: number; pattern: string }) {
  await ElMessageBox.confirm(`确认删除规则「${row.pattern}」？`, '提示', { type: 'warning' })
  await safetyApi.deleteRule(row.id)
  ElMessage.success('删除成功')
  loadData()
}

async function handleToggle(row: { id: number; enabled: boolean }) {
  await safetyApi.updateRule(row.id, { enabled: row.enabled })
  ElMessage.success(row.enabled ? '已启用' : '已禁用')
}

function openTestDialog() {
  testText.value = ''
  testResult.value = null
  testDialogVisible.value = true
}

async function handleTest() {
  if (!testText.value.trim()) {
    ElMessage.warning('请输入测试文本')
    return
  }
  testLoading.value = true
  try {
    const res = (await safetyApi.testRule({ text: testText.value })) as unknown as {
      data: { matched: boolean; ruleName?: string; action?: string }
    }
    testResult.value = res.data
  } catch {
    ElMessage.error('测试失败')
  } finally {
    testLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.safety-list-page {
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

.test-result {
  margin-top: 16px;
}
</style>
