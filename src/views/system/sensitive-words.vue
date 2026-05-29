<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>敏感词管理</span>
          <el-button type="primary" @click="handleAdd">添加敏感词</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="word" label="敏感词" min-width="200" />
        <el-table-column prop="category" label="分类" width="150">
          <template #default="{ row }">
            <el-tag>{{ row.category || '未分类' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-popconfirm title="确定删除该敏感词？" @confirm="handleDelete(row.id)">
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
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" title="添加敏感词" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="addForm" :rules="rules" label-width="80px">
        <el-form-item label="敏感词" prop="word">
          <el-input v-model="addForm.word" placeholder="请输入敏感词" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="addForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="政治敏感" value="political" />
            <el-option label="色情低俗" value="pornographic" />
            <el-option label="暴力恐怖" value="violent" />
            <el-option label="广告营销" value="spam" />
            <el-option label="辱骂攻击" value="abuse" />
            <el-option label="其他" value="other" />
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
import { sensitiveWordApi } from '@/api/community/sensitive'
import { usePagination } from '@/composables/usePagination'

const { loading, tableData, pagination, loadData, handleCurrentChange, handleSizeChange } =
  usePagination(sensitiveWordApi.list)

const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const addForm = reactive({
  word: '',
  category: '',
})

const rules = {
  word: [{ required: true, message: '请输入敏感词', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
}

function handleAdd() {
  addForm.word = ''
  addForm.category = ''
  dialogVisible.value = true
}

async function handleDelete(id: number) {
  try {
    await sensitiveWordApi.delete(id)
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
    await sensitiveWordApi.create({ word: addForm.word, category: addForm.category })
    ElMessage.success('添加成功')
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
