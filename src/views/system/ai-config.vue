<template>
  <div class="page-container">
    <el-card v-loading="pageLoading" shadow="never">
      <template #header>
        <span>AI 模型配置</span>
      </template>

      <!-- LLM Config -->
      <el-divider content-position="left">大语言模型配置</el-divider>
      <el-form label-width="140px" class="config-form">
        <el-form-item label="模型选择">
          <el-select v-model="aiConfig.llmModel" placeholder="请选择模型" style="width: 360px">
            <el-option label="GPT-4o" value="gpt-4o" />
            <el-option label="GPT-4o-mini" value="gpt-4o-mini" />
            <el-option label="Claude 3.5 Sonnet" value="claude-3-5-sonnet" />
            <el-option label="Claude 3 Haiku" value="claude-3-haiku" />
            <el-option label="DeepSeek-V3" value="deepseek-v3" />
            <el-option label="Qwen-Max" value="qwen-max" />
          </el-select>
        </el-form-item>
        <el-form-item label="API Key">
          <el-input
            v-model="aiConfig.llmApiKey"
            :type="showApiKey ? 'text' : 'password'"
            placeholder="请输入 API Key"
            style="width: 360px"
          >
            <template #append>
              <el-button :icon="showApiKey ? Hide : View" @click="showApiKey = !showApiKey" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="Temperature">
          <el-slider
            v-model="aiConfig.llmTemperature"
            :min="0"
            :max="2"
            :step="0.1"
            show-input
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item label="Max Tokens">
          <el-input-number
            v-model="aiConfig.llmMaxTokens"
            :min="256"
            :max="128000"
            :step="256"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="连接状态">
          <el-tag :type="connectionStatus === 'connected' ? 'success' : connectionStatus === 'failed' ? 'danger' : 'info'">
            {{ connectionStatusText }}
          </el-tag>
          <el-button
            type="primary"
            link
            style="margin-left: 12px"
            :loading="testing"
            @click="testConnection"
          >
            测试连接
          </el-button>
        </el-form-item>
      </el-form>

      <!-- Embedding Config -->
      <el-divider content-position="left">Embedding 配置</el-divider>
      <el-form label-width="140px" class="config-form">
        <el-form-item label="Embedding 模型">
          <el-select v-model="aiConfig.embeddingModel" placeholder="请选择 Embedding 模型" style="width: 360px">
            <el-option label="text-embedding-3-small" value="text-embedding-3-small" />
            <el-option label="text-embedding-3-large" value="text-embedding-3-large" />
            <el-option label="text-embedding-ada-002" value="text-embedding-ada-002" />
          </el-select>
        </el-form-item>
        <el-form-item label="向量维度">
          <el-input-number
            v-model="aiConfig.embeddingDimension"
            :min="128"
            :max="3072"
            :step="128"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="向量数据库连接">
          <el-input v-model="aiConfig.vectorDbUrl" placeholder="例如: http://localhost:6333" style="width: 360px" />
        </el-form-item>
      </el-form>

      <!-- RAG Config -->
      <el-divider content-position="left">RAG 配置</el-divider>
      <el-form label-width="140px" class="config-form">
        <el-form-item label="Top-K">
          <el-input-number v-model="aiConfig.ragTopK" :min="1" :max="50" style="width: 240px" />
        </el-form-item>
        <el-form-item label="最低相似度">
          <el-slider
            v-model="aiConfig.ragMinSimilarity"
            :min="0"
            :max="1"
            :step="0.05"
            show-input
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item label="启用 Rerank">
          <el-switch v-model="aiConfig.ragRerankEnabled" />
        </el-form-item>
        <el-form-item label="知识来源">
          <el-checkbox-group v-model="aiConfig.ragKnowledgeSources">
            <el-checkbox label="exercise" value="exercise">动作库</el-checkbox>
            <el-checkbox label="nutrition" value="nutrition">营养知识</el-checkbox>
            <el-checkbox label="training" value="training">训练理论</el-checkbox>
            <el-checkbox label="recovery" value="recovery">恢复方法</el-checkbox>
            <el-checkbox label="faq" value="faq">常见问题</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <!-- Rate Limit Config -->
      <el-divider content-position="left">限流配置</el-divider>
      <el-form label-width="160px" class="config-form">
        <el-form-item label="每日对话上限">
          <el-input-number v-model="aiConfig.dailyChatLimit" :min="1" :max="10000" style="width: 240px" />
        </el-form-item>
        <el-form-item label="每日计划生成上限">
          <el-input-number v-model="aiConfig.dailyPlanLimit" :min="1" :max="1000" style="width: 240px" />
        </el-form-item>
        <el-form-item label="单次最大 Token">
          <el-input-number v-model="aiConfig.maxTokensPerRequest" :min="256" :max="128000" :step="256" style="width: 240px" />
        </el-form-item>
        <el-form-item label="并发限制">
          <el-input-number v-model="aiConfig.concurrencyLimit" :min="1" :max="100" style="width: 240px" />
        </el-form-item>
      </el-form>

      <div class="save-bar">
        <el-button type="primary" :loading="saving" @click="handleSave">保存配置</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { View, Hide } from '@element-plus/icons-vue'
import { systemConfigApi } from '@/api/system/config'

const pageLoading = ref(false)
const saving = ref(false)
const testing = ref(false)
const showApiKey = ref(false)
const connectionStatus = ref<'unknown' | 'connected' | 'failed'>('unknown')

const connectionStatusText = computed(() => {
  const map = { unknown: '未测试', connected: '已连接', failed: '连接失败' }
  return map[connectionStatus.value]
})

const aiConfig = reactive({
  // LLM
  llmModel: '',
  llmApiKey: '',
  llmTemperature: 0.7,
  llmMaxTokens: 4096,
  // Embedding
  embeddingModel: '',
  embeddingDimension: 1536,
  vectorDbUrl: '',
  // RAG
  ragTopK: 5,
  ragMinSimilarity: 0.7,
  ragRerankEnabled: false,
  ragKnowledgeSources: [] as string[],
  // Rate limit
  dailyChatLimit: 100,
  dailyPlanLimit: 10,
  maxTokensPerTokens: 4096,
  maxTokensPerRequest: 4096,
  concurrencyLimit: 10,
})

async function loadConfig() {
  pageLoading.value = true
  try {
    const res = await systemConfigApi.getAiConfig()
    const data = (res as { data: Record<string, unknown> }).data || {}
    Object.assign(aiConfig, data)
  } catch {
    // Error handled by interceptor
  } finally {
    pageLoading.value = false
  }
}

async function testConnection() {
  testing.value = true
  try {
    await systemConfigApi.testAiConnection()
    connectionStatus.value = 'connected'
    ElMessage.success('连接测试成功')
  } catch {
    connectionStatus.value = 'failed'
  } finally {
    testing.value = false
  }
}

async function handleSave() {
  saving.value = true
  try {
    await systemConfigApi.updateAiConfig({ ...aiConfig })
    ElMessage.success('保存成功')
  } catch {
    // Error handled by interceptor
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 20px;
}

.config-form {
  max-width: 600px;
}

.save-bar {
  margin-top: 24px;
  text-align: center;
}
</style>
