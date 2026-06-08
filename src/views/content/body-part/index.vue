<template>
  <div class="body-part-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>部位管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增部位
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="部位名称" min-width="200" />
        <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
        <el-table-column prop="exerciseCount" label="动作数" width="80" align="center" />
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-popconfirm title="确定删除该部位？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑部位' : '新增部位'"
      width="480px"
      destroy-on-close
    >
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="80px">
        <el-form-item label="部位名称" prop="name">
          <el-input v-model="dialogForm.name" placeholder="请输入部位名称" maxlength="30" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dialogForm.sortOrder" :min="0" :max="9999" />
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
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { bodyPartApi } from '@/api/content/body-part'

interface BodyPartItem {
  id: number
  name: string
  sortOrder: number
  exerciseCount: number
}

const loading = ref(false)
const tableData = ref<BodyPartItem[]>([])

// Dialog
const dialogVisible = ref(false)
const dialogFormRef = ref<FormInstance>()
const submitting = ref(false)
const editingId = ref<number | null>(null)

const dialogForm = reactive({
  name: '',
  sortOrder: 0,
})

const dialogRules = {
  name: [{ required: true, message: '请输入部位名称', trigger: 'blur' }],
}

function handleAdd() {
  editingId.value = null
  dialogForm.name = ''
  dialogForm.sortOrder = 0
  dialogVisible.value = true
}

function handleEdit(row: BodyPartItem) {
  editingId.value = row.id
  dialogForm.name = row.name
  dialogForm.sortOrder = row.sortOrder || 0
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await dialogFormRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (editingId.value) {
      await bodyPartApi.update(editingId.value, {
        name: dialogForm.name,
        sortOrder: dialogForm.sortOrder,
      } as any)
      ElMessage.success('编辑成功')
    } else {
      await bodyPartApi.create({
        name: dialogForm.name,
        sortOrder: dialogForm.sortOrder,
      } as any)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadData()
  } catch {
    // handled by interceptor
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: BodyPartItem) {
  try {
    await bodyPartApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // handled by interceptor
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await bodyPartApi.list() as any
    tableData.value = res.data || []
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.body-part-page {
  padding: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
