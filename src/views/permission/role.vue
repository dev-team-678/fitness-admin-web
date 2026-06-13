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
      :model-value="dialogVisible"
      :title="isEdit ? '编辑角色' : '新增角色'"
      width="600px"
      destroy-on-close
      :before-close="() => (dialogVisible = false)"
      @update:model-value="(v: boolean) => (dialogVisible = v)"
      @open="onDialogOpen"
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
          <div class="permission-toolbar">
            <el-checkbox v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
            <el-button link type="primary" @click="handleExpandAll(false)">收起</el-button>
            <el-button link type="primary" @click="handleExpandAll(true)">展开</el-button>
          </div>
          <el-tree
            v-if="dialogVisible"
            ref="treeRef"
            :data="permissionTree"
            :props="{ label: 'label', children: 'children' }"
            show-checkbox
            node-key="id"
            :default-checked-keys="defaultChecked"
            :default-expand-all="true"
            @check="onTreeCheck"
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
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
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

// el-tree 的 default-checked-keys 只在初始化时生效,弹窗 destroy-on-close 重建时需要缓存上一次的值
const defaultChecked = ref<string[]>([])

// 全选状态:仅在叶子节点(权限项)层面判定
const checkAll = ref(false)

// 全部叶子节点 id,用于全选/反选
const leafNodeIds = computed<string[]>(() =>
  permissionTree.flatMap((mod) => (mod.children ?? []).map((c) => c.id)),
)

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
    tableData.value = res.data?.list || []
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
  defaultChecked.value = []
  checkAll.value = false
  dialogVisible.value = true
}

async function handleEdit(row: RoleItem) {
  isEdit.value = true
  editId.value = row.id
  editForm.name = row.name
  editForm.code = row.code || ''
  editForm.description = row.description || ''
  // 先用列表里的权限,避免 await 期间 defaultChecked 是 null
  const initialPerms = Array.isArray(row.permissions) ? row.permissions : []
  editForm.permissions = [...initialPerms]
  defaultChecked.value = [...initialPerms]
  dialogVisible.value = true
  // 拉取最新权限,避免列表接口未返回该字段时编辑为空
  try {
    const res = await roleApi.detail(row.id)
    const data = res.data
    if (data) {
      editForm.name = data.name ?? editForm.name
      editForm.code = data.code ?? editForm.code
      editForm.description = data.description ?? editForm.description
      let nextPerms: string[] = []
      if (typeof data.permissions === 'string' && data.permissions.trim()) {
        nextPerms = data.permissions.split(',').map((s: string) => s.trim()).filter(Boolean)
      } else if (Array.isArray((data as { permissions?: unknown }).permissions)) {
        nextPerms = (data as unknown as { permissions: string[] }).permissions
      }
      editForm.permissions = nextPerms
      defaultChecked.value = nextPerms
      // 详情回填后,按当前权限回算全选框状态
      checkAll.value = nextPerms.length > 0 && leafNodeIds.value.length > 0
        && leafNodeIds.value.every((id) => nextPerms.includes(id))
    }
  } catch {
    // 详情接口失败时回退到列表里的数据
  }
}

// 弹窗打开时:如果是编辑,等待树渲染完再回填勾选状态
async function onDialogOpen() {
  await nextTick()
  if (!isEdit.value) return
  // 强制刷新一次勾选,应对 destroy-on-close 后的重建
  if (defaultChecked.value.length) {
    treeRef.value?.setCheckedKeys(defaultChecked.value, false)
  }
  syncCheckAllState()
}

// 全选切换
function handleCheckAllChange(checked: string | number | boolean) {
  if (!treeRef.value) return
  if (checked) {
    treeRef.value.setCheckedKeys(leafNodeIds.value, false)
  } else {
    treeRef.value.setCheckedKeys([], false)
  }
}

// 树节点勾选变化时同步全选框状态
function onTreeCheck() {
  const checked = treeRef.value?.getCheckedKeys(false) as string[] | undefined
  const checkedSet = new Set(checked ?? [])
  checkAll.value = leafNodeIds.value.length > 0 && leafNodeIds.value.every((id) => checkedSet.has(id))
}

// 同步全选框状态(打开弹窗/编辑回填后调用)
function syncCheckAllState() {
  onTreeCheck()
}

// 展开/收起整棵树
function handleExpandAll(expand: boolean) {
  const nodes = treeRef.value?.store?.nodesMap ?? {}
  Object.values<{ expanded: boolean }>(nodes).forEach((n) => {
    n.expanded = expand
  })
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
    } as unknown as Record<string, unknown>
    if (isEdit.value) {
      await roleApi.update(editId.value, payload as never)
      ElMessage.success('更新成功')
    } else {
      await roleApi.create(payload as never)
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

.permission-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
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
