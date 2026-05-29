<template>
  <div class="category-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" @click="handleAdd()">
            <el-icon><Plus /></el-icon>
            新增分类
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="treeData"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" label="分类名称" min-width="240" />
        <el-table-column prop="sort_order" label="排序" width="80" align="center" />
        <el-table-column prop="exercise_count" label="动作数" width="80" align="center" />
        <el-table-column label="操作" width="220" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleAdd(row)">
              添加子分类
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-popconfirm title="确定删除该分类？子分类将一并删除。" @confirm="handleDelete(row)">
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
      :title="dialogTitle"
      width="480px"
      destroy-on-close
    >
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="80px">
        <el-form-item label="父分类">
          <el-input :model-value="parentName" disabled />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="dialogForm.name" placeholder="请输入分类名称" maxlength="30" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dialogForm.sort_order" :min="0" :max="9999" />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { categoryApi } from '@/api/content/category'

interface CategoryItem {
  id: number
  name: string
  parent_id: number | null
  sort_order: number
  exercise_count: number
  children?: CategoryItem[]
}

const loading = ref(false)
const rawData = ref<CategoryItem[]>([])

// Build tree from flat list
const treeData = computed(() => {
  const map = new Map<number, CategoryItem>()
  const roots: CategoryItem[] = []

  for (const item of rawData.value) {
    map.set(item.id, { ...item, children: [] })
  }

  for (const item of rawData.value) {
    const node = map.get(item.id)!
    if (item.parent_id && map.has(item.parent_id)) {
      map.get(item.parent_id)!.children!.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
})

// Dialog
const dialogVisible = ref(false)
const dialogFormRef = ref<FormInstance>()
const submitting = ref(false)
const editingId = ref<number | null>(null)
const parentId = ref<number | null>(null)

const dialogForm = reactive({
  name: '',
  sort_order: 0,
})

const dialogRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
}

const dialogTitle = computed(() => (editingId.value ? '编辑分类' : '新增分类'))

const parentName = computed(() => {
  if (!parentId.value) return '顶级分类'
  const parent = rawData.value.find((item) => item.id === parentId.value)
  return parent?.name || '-'
})

function handleAdd(parent?: CategoryItem) {
  editingId.value = null
  parentId.value = parent?.id || null
  dialogForm.name = ''
  dialogForm.sort_order = 0
  dialogVisible.value = true
}

function handleEdit(row: CategoryItem) {
  editingId.value = row.id
  parentId.value = row.parent_id
  dialogForm.name = row.name
  dialogForm.sort_order = row.sort_order || 0
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await dialogFormRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (editingId.value) {
      await categoryApi.update(editingId.value, {
        name: dialogForm.name,
        sort_order: dialogForm.sort_order,
      } as any)
      ElMessage.success('编辑成功')
    } else {
      await categoryApi.create({
        name: dialogForm.name,
        parentId: parentId.value || undefined,
      })
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

async function handleDelete(row: CategoryItem) {
  try {
    await categoryApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // handled by interceptor
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await categoryApi.list() as any
    rawData.value = res.data || []
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
.category-page {
  padding: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
