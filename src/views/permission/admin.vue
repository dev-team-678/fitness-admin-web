<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>管理员管理</span>
          <el-button type="primary" @click="handleCreate">新增管理员</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="150" />
        <el-table-column prop="roleName" label="角色" width="150">
          <template #default="{ row }">
            <el-tag>{{ row.roleName || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录时间" width="180" />
        <el-table-column prop="lastLoginIp" label="最后登录IP" width="140" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-popconfirm title="确定重置该用户密码？" @confirm="handleResetPassword(row.id)">
              <template #reference>
                <el-button type="danger" link>重置密码</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑管理员' : '新增管理员'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="editForm" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="editForm.username"
            placeholder="请输入用户名"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input
            v-model="editForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="editForm.roleId" placeholder="请选择角色" style="width: 100%">
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
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
import type { FormInstance } from 'element-plus'
import { adminApi } from '@/api/system/admin'
import { roleApi } from '@/api/system/role'
import { usePagination } from '@/composables/usePagination'

interface AdminItem {
  id: number
  username: string
  roleName: string
  roleId: number
  status: number
  lastLoginTime: string
  lastLoginIp: string
}

interface RoleOption {
  id: number
  name: string
}

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange } =
  usePagination(adminApi.list)

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const editId = ref(0)
const roleOptions = ref<RoleOption[]>([])

const editForm = reactive({
  username: '',
  password: '',
  roleId: undefined as number | undefined,
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

async function loadRoles() {
  try {
    const res = await roleApi.list()
    roleOptions.value = (res as { data: RoleOption[] }).data || []
  } catch {
    // Error handled by interceptor
  }
}

function handleCreate() {
  isEdit.value = false
  editId.value = 0
  editForm.username = ''
  editForm.password = ''
  editForm.roleId = undefined
  dialogVisible.value = true
}

function handleEdit(row: AdminItem) {
  isEdit.value = true
  editId.value = row.id
  editForm.username = row.username
  editForm.password = ''
  editForm.roleId = row.roleId
  dialogVisible.value = true
}

async function handleToggleStatus(row: AdminItem) {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    await adminApi.updateStatus(row.id, { status: newStatus })
    ElMessage.success(newStatus === 1 ? '已启用' : '已禁用')
    loadData()
  } catch {
    // Error handled by interceptor
  }
}

async function handleResetPassword(id: number) {
  try {
    await adminApi.resetPassword(id)
    ElMessage.success('密码重置成功')
  } catch {
    // Error handled by interceptor
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await adminApi.update(editId.value, { roleId: editForm.roleId })
      ElMessage.success('更新成功')
    } else {
      await adminApi.create({
        username: editForm.username,
        password: editForm.password,
        roleId: editForm.roleId,
      })
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
  loadRoles()
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

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
