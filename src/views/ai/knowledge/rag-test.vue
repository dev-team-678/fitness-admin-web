<template>
  <div class="rag-test-page">
    <el-card shadow="never" class="query-card">
      <template #header>
        <span>RAG 检索测试</span>
      </template>
      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item label="测试问题" style="flex: 1">
          <el-input
            v-model="query"
            placeholder="输入测试问题，模拟用户查询"
            clearable
            style="width: 400px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="searching" @click="handleSearch">检索测试</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="results.length > 0" shadow="never" class="results-card">
      <template #header>
        <div class="card-header">
          <span>检索结果 (Top {{ results.length }})</span>
          <div v-if="qualityScore !== null" class="quality-score">
            <span class="label">质量评分：</span>
            <el-rate v-model="qualityScore" disabled show-score text-color="#6C5CE7" />
          </div>
        </div>
      </template>

      <div v-for="(item, index) in results" :key="item.id" class="result-item">
        <div class="result-header">
          <el-tag type="info" size="small" class="rank-tag">#{{ index + 1 }}</el-tag>
          <el-tag type="success" size="small" class="score-tag">
            相关度: {{ (item.score * 100).toFixed(1) }}%
          </el-tag>
          <span class="result-title">{{ item.title }}</span>
        </div>
        <div class="result-meta">
          <el-tag size="small">{{ item.categoryName }}</el-tag>
          <el-tag v-for="tag in item.tags" :key="tag" size="small" type="info" class="tag-item">
            {{ tag }}
          </el-tag>
        </div>
        <div class="result-summary">{{ item.summary }}</div>
        <el-divider v-if="index < results.length - 1" />
      </div>
    </el-card>

    <el-empty v-else-if="searched" description="未找到相关知识" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { knowledgeApi } from '@/api/ai/knowledge'

interface RagResult {
  id: number
  title: string
  categoryName: string
  tags: string[]
  summary: string
  score: number
}

const query = ref('')
const searching = ref(false)
const searched = ref(false)
const results = ref<RagResult[]>([])
const qualityScore = ref<number | null>(null)

async function handleSearch() {
  const q = query.value.trim()
  if (!q) {
    ElMessage.warning('请输入测试问题')
    return
  }

  searching.value = true
  searched.value = true
  try {
    const res = (await knowledgeApi.ragTest({ query: q, topK: 5 })) as unknown as {
      data: { results: RagResult[]; qualityScore: number }
    }
    results.value = res.data.results || []
    qualityScore.value = res.data.qualityScore ?? null
  } catch {
    ElMessage.error('检索测试失败')
    results.value = []
    qualityScore.value = null
  } finally {
    searching.value = false
  }
}
</script>

<style lang="scss" scoped>
.rag-test-page {
  padding: 16px;
}

.query-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quality-score {
  display: flex;
  align-items: center;

  .label {
    font-size: 14px;
    color: #606266;
    margin-right: 8px;
  }
}

.result-item {
  padding: 12px 0;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.rank-tag {
  font-weight: bold;
}

.score-tag {
  font-weight: 500;
}

.result-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.tag-item {
  margin: 0;
}

.result-summary {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}
</style>
