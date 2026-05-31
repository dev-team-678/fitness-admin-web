<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleCreate">新增角色</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" min-width="150" />
        <el-table-column prop="code" label="角色编码" width="140" />
        <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确定删除该角色？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色' : '新增角色'"
      width="600px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="editForm" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="editForm.code" placeholder="如: super_admin" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="2" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item label="权限配置">
          <el-tree
            ref="treeRef"
            :data="permissionTree"
            :props="{ label: 'label', children: 'children' }"
            show-checkbox
            node-key="id"
            :default-checked-keys="editForm.permissions"
            class="permission-tree"
          />
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
import type { FormInstance, ElTree } from 'element-plus'
import { roleApi } from '@/api/system/role'

interface RoleItem {
  id: number
  name: string
  code: string
  description: string
  permissions: string[]
}

interface PermissionNode {
  id: string
  label: string
  children?: PermissionNode[]
}

const loading = ref(false)
const tableData = ref<RoleItem[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const treeRef = ref<InstanceType<typeof ElTree>>()
const editId = ref(0)

const editForm = reactive({
  name: '',
  code: '',
  description: '',
  permissions: [] as string[],
})

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
}

const modules = [
  { key: 'dashboard', label: '仪表盘' },
  { key: 'user', label: '用户管理' },
  { key: 'plan', label: '训练计划' },
  { key: 'exercise', label: '动作库' },
  { key: 'workout', label: '训练记录' },
  { key: 'body', label: '身体数据' },
  { key: 'achievement', label: '成就系统' },
  { key: 'community', label: '社区管理' },
  { key: 'ai', label: 'AI 管理' },
  { key: 'system', label: '系统设置' },
  { key: 'permission', label: '权限管理' },
]

const actions = [
  { key: 'read', label: '查看' },
  { key: 'create', label: '新增' },
  { key: 'update', label: '编辑' },
  { key: 'delete', label: '删除' },
]

const permissionTree: PermissionNode[] = modules.map((mod) => ({
  id: mod.key,
  label: mod.label,
  children: actions.map((action) => ({
    id: `${mod.key}:${action.key}`,
    label: action.label,
  })),
}))

async function loadData() {
  loading.value = true
  try {
    const res = await roleApi.list()
    const responseData = (res as { data: { list: RoleItem[] } }).data
    tableData.value = responseData?.list || []
  } catch {
    // Error handled by interceptor
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  isEdit.value = false
  editId.value = 0
  editForm.name = ''
  editForm.code = ''
  editForm.description = ''
  editForm.permissions = []
  dialogVisible.value = true
}

function handleEdit(row: RoleItem) {
  isEdit.value = true
  editId.value = row.id
  editForm.name = row.name
  editForm.code = row.code || ''
  editForm.description = row.description || ''
  editForm.permissions = row.permissions || []
  dialogVisible.value = true
}

async function handleDelete(id: number) {
  try {
    await roleApi.delete(id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // Error handled by interceptor
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const checkedKeys = treeRef.value?.getCheckedKeys(false) as string[]
  const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() as string[]
  const allPermissions = [...checkedKeys, ...halfCheckedKeys].filter((key) => key.includes(':'))

  submitting.value = true
  try {
    const payload = {
      name: editForm.name,
      code: editForm.code,
      description: editForm.description,
      permissions: allPermissions,
    }
    if (isEdit.value) {
      await roleApi.update(editId.value, payload)
      ElMessage.success('更新成功')
    } else {
      await roleApi.create(payload)
      ElMessage.success('创建成功')
    }
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

.permission-tree {
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
}
</style>
