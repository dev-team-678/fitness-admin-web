<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>系统配置</span>
          <el-button type="primary" :icon="Refresh" @click="loadData">刷新</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="configKey" label="配置键" min-width="180" show-overflow-tooltip />
        <el-table-column prop="configValue" label="配置值" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ maskValue(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
        <el-table-column prop="updatedAt" label="最后更新" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="编辑配置" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="editForm" :rules="rules" label-width="100px">
        <el-form-item label="配置键">
          <el-input :model-value="editForm.configKey" disabled />
        </el-form-item>
        <el-form-item label="配置值" prop="configValue">
          <el-input v-model="editForm.configValue" type="textarea" :rows="3" placeholder="请输入配置值" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input :model-value="editForm.description" disabled type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { systemConfigApi } from '@/api/system/config'

interface ConfigItem {
  id: number
  configKey: string
  configValue: string
  description: string
  updatedAt: string
}

const loading = ref(false)
const tableData = ref<ConfigItem[]>([])

const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const editForm = reactive({
  configKey: '',
  configValue: '',
  description: '',
})

const rules = {
  configValue: [{ required: true, message: '请输入配置值', trigger: 'blur' }],
}

function maskValue(row: ConfigItem): string {
  const sensitiveKeys = ['password', 'secret', 'token', 'apikey', 'api_key', 'access_key']
  const isSensitive = sensitiveKeys.some((k) => row.configKey.toLowerCase().includes(k))
  if (isSensitive && row.configValue && row.configValue.length > 4) {
    return '****' + row.configValue.slice(-4)
  }
  return row.configValue
}

async function loadData() {
  loading.value = true
  try {
    const res = await systemConfigApi.list() as { data: ConfigItem[] }
    tableData.value = res.data || []
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

function handleEdit(row: ConfigItem) {
  editForm.configKey = row.configKey
  editForm.configValue = row.configValue
  editForm.description = row.description
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await systemConfigApi.update(editForm.configKey, { value: editForm.configValue })
    ElMessage.success('更新成功')
    dialogVisible.value = false
    loadData()
  } catch {
    // Error handled by interceptor
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
