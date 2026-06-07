<template>
  <div class="knowledge-edit-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑知识' : '新增知识' }}</span>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        style="max-width: 960px"
      >
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="cat in categories" :key="cat.code" :label="cat.name" :value="cat.code" />
          </el-select>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" maxlength="200" show-word-limit />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <MdEditor v-model="form.content" style="height: 480px" />
        </el-form-item>

        <el-form-item label="标签">
          <div class="tag-input-area">
            <el-tag
              v-for="tag in form.tags"
              :key="tag"
              closable
              class="tag-item"
              @close="removeTag(tag)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="tagInputVisible"
              ref="tagInputRef"
              v-model="tagInputValue"
              size="small"
              class="tag-input"
              @keyup.enter="addTag"
              @blur="addTag"
            />
            <el-button v-else size="small" @click="showTagInput">+ 添加标签</el-button>
          </div>
        </el-form-item>

        <el-form-item label="来源">
          <el-input v-model="form.source" placeholder="知识来源（如：书籍、网站等）" />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { knowledgeApi } from '@/api/ai/knowledge'
import type { FormInstance, InputInstance } from 'element-plus'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const tagInputRef = ref<InputInstance>()
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const submitting = ref(false)
interface Category {
  id: number
  code: string
  name: string
}
const categories = ref<Category[]>([])

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  category: '',
  title: '',
  content: '',
  tags: [] as string[],
  source: '',
  status: 1 as number,
})

const rules = {
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
}

function showTagInput() {
  tagInputVisible.value = true
  nextTick(() => tagInputRef.value?.focus())
}

function addTag() {
  const val = tagInputValue.value.trim()
  if (val && !form.tags.includes(val)) {
    form.tags.push(val)
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

function removeTag(tag: string) {
  form.tags = form.tags.filter((t) => t !== tag)
}

async function loadCategories() {
  const res = (await knowledgeApi.getCategories()) as unknown as { data: Category[] }
  categories.value = res.data || []
}

async function loadDetail() {
  if (!route.params.id) return
  const res = (await knowledgeApi.detail(Number(route.params.id))) as unknown as {
    data: { category: string; title: string; content: string; tags: string[] | string; source: string; status: number }
  }
  const d = res.data
  form.category = d.category
  form.title = d.title
  form.content = d.content
  // tags 可能是数组或 JSON 字符串，统一处理
  if (Array.isArray(d.tags)) {
    form.tags = d.tags
  } else if (typeof d.tags === 'string' && d.tags.trim()) {
    try {
      const parsed = JSON.parse(d.tags)
      form.tags = Array.isArray(parsed) ? parsed : []
    } catch {
      form.tags = []
    }
  } else {
    form.tags = []
  }
  form.source = d.source || ''
  form.status = d.status
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const payload = { ...form }
    if (isEdit.value) {
      await knowledgeApi.update(Number(route.params.id), payload)
      ElMessage.success('更新成功')
    } else {
      await knowledgeApi.create(payload)
      ElMessage.success('创建成功')
    }
    router.push('/ai/knowledge')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

function goBack() {
  router.push('/ai/knowledge')
}

async function initPage() {
  await loadCategories()
  if (isEdit.value) {
    await loadDetail()
  } else {
    // 新增时重置表单
    form.category = ''
    form.title = ''
    form.content = ''
    form.tags = []
    form.source = ''
    form.status = 1
  }
}

watch(
  () => route.params.id,
  () => initPage(),
)

onMounted(() => initPage())
</script>

<style lang="scss" scoped>
.knowledge-edit-page {
  padding: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tag-input-area {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.tag-item {
  margin: 0;
}

.tag-input {
  width: 120px;
}
</style>
