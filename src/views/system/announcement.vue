<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>公告管理</span>
          <el-button type="primary" @click="handleCreate">发布公告</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column label="内容预览" min-width="250" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.content?.slice(0, 100) }}{{ row.content?.length > 100 ? '...' : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="typeTagMap[row.type]">{{ typeLabelMap[row.type] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确定删除该公告？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
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
      :title="isEdit ? '编辑公告' : '发布公告'"
      width="600px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="editForm" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="editForm.title" placeholder="请输入公告标题" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="editForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入公告内容"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="editForm.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="通知" value="notice" />
            <el-option label="更新" value="update" />
            <el-option label="活动" value="event" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布时间">
          <el-date-picker
            v-model="editForm.publishTime"
            type="datetime"
            placeholder="选择发布时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="editForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="已发布"
            inactive-text="草稿"
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
import type { FormInstance } from 'element-plus'
import { announcementApi } from '@/api/system/announcement'
import { usePagination } from '@/composables/usePagination'

interface Announcement {
  id: number
  title: string
  content: string
  type: string
  status: number
  publishTime: string
}

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange } =
  usePagination(announcementApi.list)

const typeLabelMap: Record<string, string> = {
  notice: '通知',
  update: '更新',
  event: '活动',
}

const typeTagMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined> = {
  notice: undefined,
  update: 'success',
  event: 'warning',
}

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const editId = ref(0)

const editForm = reactive({
  title: '',
  content: '',
  type: 'notice',
  publishTime: '',
  status: 1,
})

const rules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
}

function handleCreate() {
  isEdit.value = false
  editId.value = 0
  editForm.title = ''
  editForm.content = ''
  editForm.type = 'notice'
  editForm.publishTime = ''
  editForm.status = 1
  dialogVisible.value = true
}

function handleEdit(row: Announcement) {
  isEdit.value = true
  editId.value = row.id
  editForm.title = row.title
  editForm.content = row.content
  editForm.type = row.type
  editForm.publishTime = row.publishTime || ''
  editForm.status = row.status
  dialogVisible.value = true
}

async function handleDelete(id: number) {
  try {
    await announcementApi.delete(id)
    ElMessage.success('删除成功')
    loadData()
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
      await announcementApi.update(editId.value, { ...editForm })
      ElMessage.success('更新成功')
    } else {
      await announcementApi.create({ ...editForm })
      ElMessage.success('发布成功')
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

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
