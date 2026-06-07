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
        <el-table-column label="头像" width="80" align="center">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar">
              {{ (row.nickname || row.username)?.charAt(0) }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="nickname" label="昵称" min-width="120">
          <template #default="{ row }">
            <span>{{ row.nickname || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="userId" label="关联用户ID" width="110" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.userId" type="success">{{ row.userId }}</el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="roleName" label="角色" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.roleName || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 || row.status === true ? 'success' : 'danger'">
              {{ row.status === 1 || row.status === true ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录时间" width="170" />
        <el-table-column prop="lastLoginIp" label="最后登录IP" width="130" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button
              :type="row.status === 1 || row.status === true ? 'warning' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 || row.status === true ? '禁用' : '启用' }}
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
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="头像">
          <div class="avatar-upload">
            <el-avatar :size="80" :src="editForm.avatar">
              {{ (editForm.nickname || editForm.username || '?').charAt(0) }}
            </el-avatar>
            <el-upload
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :http-request="(options: any) => handleAvatarUpload(options.file)"
              accept="image/*"
            >
              <el-button :loading="uploading" size="small" style="margin-top: 8px">
                {{ uploading ? '上传中...' : '更换头像' }}
              </el-button>
            </el-upload>
          </div>
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
        <el-form-item label="关联小程序用户">
          <el-select
            v-model="editForm.userId"
            filterable
            remote
            clearable
            placeholder="输入昵称搜索小程序用户"
            :remote-method="searchUsers"
            :loading="userSearchLoading"
            style="width: 100%"
          >
            <el-option
              v-for="u in userOptions"
              :key="u.id"
              :label="`${u.nickname || u.id} (ID: ${u.id})`"
              :value="u.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
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
import { userApi } from '@/api/user/user'
import { usePagination } from '@/composables/usePagination'
import { useQiniuUpload } from '@/composables/useQiniuUpload'

interface AdminItem {
  id: number
  username: string
  nickname: string
  avatar: string
  userId: number | null
  roleName: string
  roleId: number
  email: string
  phone: string
  status: number
  lastLoginTime: string
  lastLoginIp: string
}

interface RoleOption {
  id: number
  name: string
}

interface UserOption {
  id: number
  nickname: string
}

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange } =
  usePagination(adminApi.list)

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const editId = ref(0)
const roleOptions = ref<RoleOption[]>([])
const { upload, uploading } = useQiniuUpload()

const editForm = reactive({
  username: '',
  password: '',
  roleId: undefined as number | undefined,
  nickname: '',
  avatar: '',
  userId: undefined as number | undefined,
  email: '',
  phone: '',
})

const userSearchLoading = ref(false)
const userOptions = ref<UserOption[]>([])

async function searchUsers(query: string) {
  if (!query) {
    userOptions.value = []
    return
  }
  userSearchLoading.value = true
  try {
    const res = await userApi.list({ pageNum: 1, pageSize: 20, keyword: query })
    const data = (res as any).data
    userOptions.value = data?.list || data || []
  } catch {
    userOptions.value = []
  } finally {
    userSearchLoading.value = false
  }
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

async function handleAvatarUpload(file: File) {
  try {
    const url = await upload(file, 'admin-avatars')
    editForm.avatar = url
    ElMessage.success('头像上传成功')
  } catch {
    ElMessage.error('头像上传失败')
  }
}

function beforeAvatarUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

async function loadRoles() {
  try {
    const res = await roleApi.list()
    const responseData = (res as { data: { list: RoleOption[] } }).data
    roleOptions.value = responseData?.list || []
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
  editForm.nickname = ''
  editForm.avatar = ''
  editForm.userId = undefined
  editForm.email = ''
  editForm.phone = ''
  userOptions.value = []
  dialogVisible.value = true
}

function handleEdit(row: AdminItem) {
  isEdit.value = true
  editId.value = row.id
  editForm.username = row.username
  editForm.password = ''
  editForm.roleId = row.roleId
  editForm.nickname = row.nickname || ''
  editForm.avatar = row.avatar || ''
  editForm.userId = row.userId || undefined
  editForm.email = row.email || ''
  editForm.phone = row.phone || ''
  userOptions.value = row.userId ? [{ id: row.userId, nickname: '' }] : []
  dialogVisible.value = true
}

async function handleToggleStatus(row: AdminItem) {
  try {
    const isEnabled = row.status === 1
    const newStatus = isEnabled ? 2 : 1
    await adminApi.updateStatus(row.id, { status: newStatus })
    ElMessage.success(newStatus === 1 ? '已启用' : '已禁用')
    await loadData()
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
      await adminApi.update(editId.value, {
        roleId: editForm.roleId,
        userId: editForm.userId,
        nickname: editForm.nickname,
        avatar: editForm.avatar,
        email: editForm.email,
        phone: editForm.phone,
      })
      ElMessage.success('更新成功')
    } else {
      await adminApi.create({
        username: editForm.username,
        password: editForm.password,
        roleId: editForm.roleId,
        nickname: editForm.nickname,
        avatar: editForm.avatar,
        userId: editForm.userId,
        email: editForm.email,
        phone: editForm.phone,
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

.text-muted {
  color: #c0c4cc;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
