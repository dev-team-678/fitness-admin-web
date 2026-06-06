<template>
  <div v-loading="pageLoading" class="user-detail-page">
    <!-- Header -->
    <div class="page-header">
      <el-button text @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>返回
      </el-button>
      <span class="page-title">用户详情</span>
    </div>

    <!-- Basic Info Card -->
    <el-card shadow="never" class="detail-card">
      <template #header>
        <span class="card-title">基本信息</span>
      </template>
      <div class="basic-info">
        <div class="avatar-section">
          <el-avatar v-if="user.avatarUrl" :src="user.avatarUrl" :size="80" />
          <el-avatar v-else :size="80">
            <el-icon :size="36"><User /></el-icon>
          </el-avatar>
          <el-tag
            :type="user.status === 1 ? 'success' : 'danger'"
            effect="light"
            class="status-tag"
          >
            {{ user.status === 1 ? '正常' : '已禁用' }}
          </el-tag>
        </div>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="用户ID">{{ user.id }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ user.nickname || '-' }}</el-descriptions-item>
          <el-descriptions-item label="OpenID">
            <el-text type="info" size="small" truncated>{{ user.openid || '-' }}</el-text>
          </el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ user.gender === 1 ? '男' : user.gender === 2 ? '女' : '未知' }}
          </el-descriptions-item>
          <el-descriptions-item label="生日">{{ user.birthday || '-' }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ user.createdAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="健身目标">{{ formatGoal(user.fitnessGoal) }}</el-descriptions-item>
          <el-descriptions-item label="健身水平">{{ formatLevel(user.fitnessLevel) }}</el-descriptions-item>
          <el-descriptions-item label="训练频率">{{ user.workoutDaysPerWeek ? `${user.workoutDaysPerWeek}天/周` : '-' }}</el-descriptions-item>
          <el-descriptions-item label="训练时长">{{ user.workoutDurationMin ? `${user.workoutDurationMin}分钟` : '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- Training Stats Card -->
    <el-card shadow="never" class="detail-card">
      <template #header>
        <span class="card-title">身体数据</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6" :xs="12" :sm="8" :md="6">
          <div class="stat-item">
            <div class="stat-value">{{ user.heightCm ?? '-' }}</div>
            <div class="stat-label">身高(cm)</div>
          </div>
        </el-col>
        <el-col :span="6" :xs="12" :sm="8" :md="6">
          <div class="stat-item">
            <div class="stat-value">{{ user.currentWeightKg ?? '-' }}</div>
            <div class="stat-label">当前体重(kg)</div>
          </div>
        </el-col>
        <el-col :span="6" :xs="12" :sm="8" :md="6">
          <div class="stat-item">
            <div class="stat-value">{{ user.targetWeightKg ?? '-' }}</div>
            <div class="stat-label">目标体重(kg)</div>
          </div>
        </el-col>
        <el-col :span="6" :xs="12" :sm="8" :md="6">
          <div class="stat-item">
            <div class="stat-value">{{ user.bmi ?? '-' }}</div>
            <div class="stat-label">BMI</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- Body Data Trends -->
    <el-card shadow="never" class="detail-card">
      <template #header>
        <span class="card-title">身体数据趋势</span>
      </template>
      <el-row :gutter="16">
        <el-col :span="12">
          <div class="chart-placeholder">
            <el-empty description="体重趋势图（开发中）" :image-size="80" />
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-placeholder">
            <el-empty description="体脂率趋势图（开发中）" :image-size="80" />
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- Achievements Card -->
    <el-card shadow="never" class="detail-card">
      <template #header>
        <span class="card-title">已解锁成就</span>
      </template>
      <div v-if="achievements.length > 0" class="achievements-grid">
        <div v-for="item in achievements" :key="item.id" class="achievement-item">
          <el-tooltip :content="item.description" placement="top">
            <div class="achievement-inner">
              <el-icon :size="28" color="#e6a23c"><Trophy /></el-icon>
              <span class="achievement-name">{{ item.name }}</span>
            </div>
          </el-tooltip>
        </div>
      </div>
      <el-empty v-else description="暂无成就" :image-size="60" />
    </el-card>

    <!-- Recent Training Records -->
    <el-card shadow="never" class="detail-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">近期训练记录</span>
          <el-button text type="primary" size="small" @click="loadMoreWorkouts">加载更多</el-button>
        </div>
      </template>
      <el-table :data="workouts" border stripe>
        <el-table-column prop="id" label="记录ID" width="90" align="center" />
        <el-table-column prop="name" label="训练名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="startTime" label="开始时间" width="170" align="center" />
        <el-table-column prop="durationMin" label="时长(分钟)" width="110" align="center" />
        <el-table-column prop="totalVolumeKg" label="容量(kg)" width="110" align="center" />
        <el-table-column prop="totalSets" label="组数" width="80" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : 'info'" effect="light" size="small">
              {{ row.status === 'completed' ? '已完成' : row.status === 'in_progress' ? '进行中' : '已取消' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- AI Fitness Profile -->
    <el-card shadow="never" class="detail-card">
      <template #header>
        <span class="card-title">AI 健身档案</span>
      </template>
      <div v-if="aiProfile">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="伤病情况">
            {{ aiProfile.injuries || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="健康状态">
            {{ Array.isArray(aiProfile.healthConditions) ? aiProfile.healthConditions.join('、') : (aiProfile.healthConditions || '-') }}
          </el-descriptions-item>
          <el-descriptions-item label="可用器材" :span="2">
            <div v-if="aiProfile.availableEquipment && aiProfile.availableEquipment.length">
              <el-tag
                v-for="eq in aiProfile.availableEquipment"
                :key="eq"
                class="equipment-tag"
                effect="plain"
                size="small"
              >
                {{ eq }}
              </el-tag>
            </div>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="训练偏好" :span="2">
            {{ aiProfile.trainingPreferences || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="AI 备注" :span="2">
            <div class="ai-notes">{{ aiProfile.aiNotes || '-' }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <el-empty v-else description="暂无 AI 档案数据" :image-size="60" />
    </el-card>

    <!-- Recent AI Conversations -->
    <el-card shadow="never" class="detail-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">近期 AI 对话</span>
          <el-button text type="primary" size="small" @click="viewAllChats">查看全部</el-button>
        </div>
      </template>
      <el-table v-if="aiChats.length > 0" :data="aiChats" border stripe>
        <el-table-column prop="id" label="对话ID" width="100" align="center" />
        <el-table-column prop="title" label="主题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="messageCount" label="消息数" width="100" align="center" />
        <el-table-column prop="lastMessageTime" label="最后消息时间" width="170" align="center" />
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewChat(row.id)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="暂无 AI 对话记录" :image-size="60" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, User, Trophy } from '@element-plus/icons-vue'
import { userApi } from '@/api/user/user'

const route = useRoute()
const router = useRouter()
const userId = computed(() => Number(route.params.id))

const pageLoading = ref(false)

// User basic info
const user = reactive<Record<string, any>>({})

// Training stats - derived from user detail response
const stats = reactive<Record<string, any>>({
  heightCm: null,
  currentWeightKg: null,
  targetWeightKg: null,
  bmi: null,
})

// Achievements
const achievements = ref<any[]>([])

// Workout records
const workouts = ref<any[]>([])
const workoutPage = ref(1)

// AI profile
const aiProfile = ref<Record<string, any> | null>(null)

// AI chats
const aiChats = ref<any[]>([])

// Formatters
const goalMap: Record<string, string> = {
  lose_fat: '减脂',
  gain_muscle: '增肌',
  keep_fit: '保持健康',
  improve_endurance: '提升耐力',
}

const levelMap: Record<string, string> = {
  beginner: '初学者',
  intermediate: '进阶',
  advanced: '高级',
}

function formatGoal(goal: string) {
  return goalMap[goal] || goal || '-'
}

function formatLevel(level: string) {
  return levelMap[level] || level || '-'
}

// Load data
async function loadUserDetail() {
  pageLoading.value = true
  try {
    const res = (await userApi.detail(userId.value)) as any
    Object.assign(user, res.data || {})
  } catch (err: any) {
    ElMessage.error(err.message || '加载用户信息失败')
  } finally {
    pageLoading.value = false
  }
}

async function loadStats() {
  // Stats are derived from user detail, no separate call needed
}

async function loadAchievements() {
  try {
    const res = (await userApi.getAchievements(userId.value)) as any
    achievements.value = res.data || []
  } catch {
    // ignore
  }
}

async function loadWorkouts(reset = false) {
  if (reset) {
    workoutPage.value = 1
    workouts.value = []
  }
  try {
    const res = (await userApi.getWorkouts(userId.value, { page: workoutPage.value, pageSize: 10 })) as any
    const list = res.data?.list || res.data || []
    if (reset) {
      workouts.value = list
    } else {
      workouts.value.push(...list)
    }
  } catch {
    // ignore
  }
}

function loadMoreWorkouts() {
  workoutPage.value++
  loadWorkouts()
}

async function loadAiProfile() {
  try {
    const res = (await userApi.getAiProfile(userId.value)) as any
    aiProfile.value = res.data || null
  } catch {
    // ignore
  }
}

async function loadAiChats() {
  try {
    const res = (await userApi.getAiChats(userId.value, { page: 1, pageSize: 5 })) as any
    aiChats.value = res.data?.list || res.data || []
  } catch {
    // ignore
  }
}

function viewChat(chatId: number) {
  router.push(`/ai/chat/${chatId}`)
}

function viewAllChats() {
  router.push({ path: '/ai/chats', query: { user_id: String(userId.value) } })
}

// Init
watch(
  () => route.params.id,
  async () => {
    await loadUserDetail()
    await Promise.all([
      loadAchievements(),
      loadWorkouts(true),
      loadAiProfile(),
      loadAiChats(),
    ])
  },
)

onMounted(async () => {
  await loadUserDetail()
  await Promise.all([
    loadAchievements(),
    loadWorkouts(true),
    loadAiProfile(),
    loadAiChats(),
  ])
})
</script>

<style lang="scss" scoped>
.user-detail-page {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.detail-card {
  margin-bottom: 16px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.basic-info {
  display: flex;
  gap: 24px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.status-tag {
  width: 60px;
  text-align: center;
}

.stat-item {
  text-align: center;
  padding: 16px 8px;
  border-radius: 8px;
  background: #f5f7fa;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1.4;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.chart-placeholder {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
}

.achievements-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.achievement-item {
  cursor: default;
}

.achievement-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
}

.achievement-name {
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
}

.equipment-tag {
  margin-right: 6px;
  margin-bottom: 4px;
}

.ai-notes {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #606266;
}
</style>
