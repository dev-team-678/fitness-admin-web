<template>
  <div class="safety-edit-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑安全规则' : '新增安全规则' }}</span>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 700px"
      >
        <el-form-item label="规则类型" prop="ruleType">
          <el-select v-model="form.ruleType" placeholder="请选择规则类型" style="width: 100%">
            <el-option label="敏感词" value="sensitive" />
            <el-option label="违禁词" value="prohibited" />
            <el-option label="医疗限制" value="medical" />
            <el-option label="免责声明" value="disclaimer" />
          </el-select>
        </el-form-item>

        <el-form-item label="匹配模式" prop="matchMode">
          <el-radio-group v-model="form.matchMode">
            <el-radio value="keyword">关键词</el-radio>
            <el-radio value="regex">正则表达式</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="匹配规则" prop="pattern">
          <el-input
            v-model="form.pattern"
            type="textarea"
            :rows="3"
            :placeholder="form.matchMode === 'regex' ? '输入正则表达式' : '输入关键词，多个用逗号分隔'"
          />
        </el-form-item>

        <el-form-item label="处置动作" prop="action">
          <el-select v-model="form.action" placeholder="请选择处置动作" style="width: 100%">
            <el-option label="拦截" value="block" />
            <el-option label="警告" value="warn" />
            <el-option label="过滤" value="filter" />
            <el-option label="免责声明" value="disclaimer" />
          </el-select>
        </el-form-item>

        <el-form-item label="回复模板">
          <el-input
            v-model="form.responseTemplate"
            type="textarea"
            :rows="3"
            placeholder="匹配后的回复模板（可选，支持 {reason} 变量）"
          />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            placeholder="规则描述"
          />
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="form.priority" :min="1" :max="100" />
          <span class="form-hint">数值越大优先级越高</span>
        </el-form-item>

        <el-form-item v-if="form.matchMode === 'regex'" label="正则超时(ms)">
          <el-input-number v-model="form.regexTimeoutMs" :min="100" :max="10000" :step="100" />
          <span class="form-hint">防止正则回溯导致性能问题</span>
        </el-form-item>

        <el-form-item label="启用状态">
          <el-switch v-model="form.isEnabled" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { safetyApi } from '@/api/ai/safety'
import type { FormInstance } from 'element-plus'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  ruleType: '',
  matchMode: 'keyword',
  pattern: '',
  action: '',
  responseTemplate: '',
  description: '',
  priority: 10,
  regexTimeoutMs: 1000,
  isEnabled: 1 as number,
})

const rules = {
  ruleType: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
  matchMode: [{ required: true, message: '请选择匹配模式', trigger: 'change' }],
  pattern: [{ required: true, message: '请输入匹配规则', trigger: 'blur' }],
  action: [{ required: true, message: '请选择处置动作', trigger: 'change' }],
  priority: [{ required: true, message: '请设置优先级', trigger: 'change' }],
}

async function loadDetail() {
  if (!route.params.id) return
  const res = (await safetyApi.ruleDetail(Number(route.params.id))) as unknown as { data: typeof form }
  Object.assign(form, res.data)
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await safetyApi.updateRule(Number(route.params.id), { ...form })
      ElMessage.success('更新成功')
    } else {
      await safetyApi.createRule({ ...form })
      ElMessage.success('创建成功')
    }
    router.push('/ai/safety/rules')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

function goBack() {
  router.push('/ai/safety/rules')
}

watch(
  () => route.params.id,
  () => {
    if (isEdit.value) {
      loadDetail()
    }
  },
)

onMounted(() => {
  if (isEdit.value) {
    loadDetail()
  }
})
</script>

<style lang="scss" scoped>
.safety-edit-page {
  padding: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-hint {
  margin-left: 12px;
  color: #909399;
  font-size: 13px;
}
</style>
