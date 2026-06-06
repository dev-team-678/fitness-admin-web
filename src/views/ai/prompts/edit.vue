<template>
  <div class="prompt-edit-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑提示词模板' : '新增提示词模板' }}</span>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 960px"
      >
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入模板名称" />
        </el-form-item>

        <el-form-item v-if="isEdit" label="当前版本">
          <el-tag>v{{ form.version }}</el-tag>
        </el-form-item>

        <el-form-item label="模板内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="16"
            placeholder="请输入提示词模板内容，使用 {{变量名}} 格式定义变量"
            class="content-textarea"
          />
        </el-form-item>

        <el-form-item label="变量列表">
          <div v-if="variables.length > 0" class="variables-list">
            <el-tag v-for="v in variables" :key="v" type="info" class="variable-tag">
              {{ formatVar(v) }}
            </el-tag>
          </div>
          <span v-else class="no-variables">未检测到变量</span>
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="form.isActive" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isEdit ? '保存为新版本' : '创建' }}
          </el-button>
          <el-button v-if="isEdit" type="warning" :loading="rollbackLoading" @click="handleRollback">
            回滚到上一版本
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="isEdit" shadow="never" class="history-card">
      <template #header>
        <span>版本历史</span>
      </template>
      <el-timeline v-if="versions.length > 0">
        <el-timeline-item
          v-for="v in versions"
          :key="v.version"
          :timestamp="v.createdAt"
          :type="v.version === form.version ? 'primary' : ''"
          placement="top"
        >
          <div class="version-item">
            <div class="version-info">
              <el-tag :type="v.version === form.version ? 'primary' : 'info'" size="small">
                v{{ v.version }}
                <span v-if="v.version === form.version"> (当前)</span>
              </el-tag>
              <span class="version-author">{{ v.createdBy }}</span>
            </div>
            <div class="version-preview">{{ v.contentPreview }}</div>
            <el-button
              v-if="v.version !== form.version"
              link
              type="primary"
              size="small"
              @click="restoreVersion(v)"
            >
              恢复此版本
            </el-button>
          </div>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无版本记录" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { promptApi } from '@/api/ai/prompt'
import type { FormInstance } from 'element-plus'

interface Version {
  version: number
  content: string
  contentPreview: string
  createdBy: string
  createdAt: string
}

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const rollbackLoading = ref(false)

const isEdit = computed(() => !!route.params.id && route.params.id !== '0')

const form = reactive({
  name: '',
  content: '',
  templateKey: '',
  version: 0,
  isActive: 1 as number,
})

const rules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  content: [{ required: true, message: '请输入模板内容', trigger: 'blur' }],
}

const variables = computed(() => {
  const regex = /\{\{(\w+)\}\}/g
  const vars: string[] = []
  let match
  while ((match = regex.exec(form.content)) !== null) {
    if (!vars.includes(match[1])) {
      vars.push(match[1])
    }
  }
  return vars
})

const versions = ref<Version[]>([])

async function loadDetail() {
  if (!route.params.id) return
  const res = (await promptApi.detail(Number(route.params.id))) as unknown as {
    data: { name: string; content: string; templateKey: string; version: number; isActive: number }
  }
  const d = res.data
  form.name = d.name
  form.content = d.content
  form.templateKey = d.templateKey || ''
  form.version = d.version
  form.isActive = d.isActive
}

async function loadVersions() {
  if (!route.params.id) return
  const res = (await promptApi.versions(Number(route.params.id))) as unknown as { data: Version[] }
  versions.value = res.data || []
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await promptApi.update(Number(route.params.id), { ...form })
      ElMessage.success('已保存为新版本')
      await loadDetail()
      await loadVersions()
    } else {
      await promptApi.create({ ...form })
      ElMessage.success('创建成功')
      router.push('/ai/safety/prompts')
    }
  } catch {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

async function handleRollback() {
  await ElMessageBox.confirm('确认回滚到上一版本？当前未保存的修改将丢失。', '提示', {
    type: 'warning',
  })
  rollbackLoading.value = true
  try {
    await promptApi.rollback(Number(route.params.id))
    ElMessage.success('回滚成功')
    await loadDetail()
    await loadVersions()
  } catch {
    ElMessage.error('回滚失败')
  } finally {
    rollbackLoading.value = false
  }
}

function restoreVersion(v: Version) {
  form.content = v.content
  ElMessage.success(`已加载 v${v.version} 内容，请保存以创建新版本`)
}

function formatVar(name: string): string {
  return '{{' + name + '}}'
}

function goBack() {
  router.push('/ai/safety/prompts')
}

watch(
  () => route.params.id,
  async () => {
    if (isEdit.value) {
      await loadDetail()
      await loadVersions()
    }
  },
)

onMounted(async () => {
  if (isEdit.value) {
    await loadDetail()
    await loadVersions()
  }
})
</script>

<style lang="scss" scoped>
.prompt-edit-page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.content-textarea :deep(textarea) {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.6;
}

.variables-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.variable-tag {
  font-family: 'Courier New', Courier, monospace;
}

.no-variables {
  color: #909399;
  font-size: 13px;
}

.version-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.version-author {
  font-size: 13px;
  color: #909399;
}

.version-preview {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  max-height: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
