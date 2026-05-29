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
          <el-avatar v-if="user.avatar" :src="user.avatar" :size="80" />
          <el-avatar v-else :size="80">
            <el-icon :size="36"><User /></el-icon>
          </el-avatar>
          <el-tag
            :type="user.status === 'active' ? 'success' : 'danger'"
            effect="light"
            class="status-tag"
          >
            {{ user.status === 'active' ? '正常' : '已禁用' }}
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
          <el-descriptions-item label="年龄">{{ user.age ? `${user.age}岁` : '-' }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ user.created_at || '-' }}</el-descriptions-item>
          <el-descriptions-item label="健身目标">{{ formatGoal(user.goal) }}</el-descriptions-item>
          <el-descriptions-item label="健身水平">{{ formatLevel(user.level) }}</el-descriptions-item>
          <el-descriptions-item label="训练频率">{{ user.frequency || '-' }}</el-descriptions-item>
          <el-descriptions-item label="训练时长">{{ user.duration || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- Training Stats Card -->
    <el-card shadow="never" class="detail-card">
      <template #header>
        <span class="card-title">训练统计</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="4" :xs="12" :sm="8" :md="4">
          <div class="stat-item">
            <div class="stat-value">{{ stats.total_workouts ?? '-' }}</div>
            <div class="stat-label">总训练次数</div>
          </div>
        </el-col>
        <el-col :span="4" :xs="12" :sm="8" :md="4">
          <div class="stat-item">
            <div class="stat-value">{{ stats.total_duration ?? '-' }}</div>
            <div class="stat-label">总训练时长(分钟)</div>
          </div>
        </el-col>
        <el-col :span="4" :xs="12" :sm="8" :md="4">
          <div class="stat-item">
            <div class="stat-value">{{ stats.total_volume ?? '-' }}</div>
            <div class="stat-label">总训练容量(kg)</div>
          </div>
        </el-col>
        <el-col :span="4" :xs="12" :sm="8" :md="4">
          <div class="stat-item">
            <div class="stat-value">{{ stats.streak_days ?? '-' }}</div>
            <div class="stat-label">当前连续天数</div>
          </div>
        </el-col>
        <el-col :span="4" :xs="12" :sm="8" :md="4">
          <div class="stat-item">
            <div class="stat-value">{{ stats.best_streak ?? '-' }}</div>
            <div class="stat-label">最佳连续天数</div>
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
        <el-table-column prop="started_at" label="开始时间" width="170" align="center" />
        <el-table-column prop="duration" label="时长(分钟)" width="110" align="center" />
        <el-table-column prop="volume" label="容量(kg)" width="110" align="center" />
        <el-table-column prop="exercise_count" label="动作数" width="90" align="center" />
        <el-table-column prop="set_count" label="组数" width="80" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.completed ? 'success' : 'info'" effect="light" size="small">
              {{ row.completed ? '已完成' : '未完成' }}
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
            {{ aiProfile.health_status || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="可用器材" :span="2">
            <div v-if="aiProfile.available_equipment && aiProfile.available_equipment.length">
              <el-tag
                v-for="eq in aiProfile.available_equipment"
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
            {{ aiProfile.training_preferences || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="AI 备注" :span="2">
            <div class="ai-notes">{{ aiProfile.ai_notes || '-' }}</div>
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
        <el-table-column prop="message_count" label="消息数" width="100" align="center" />
        <el-table-column prop="last_message_at" label="最后消息时间" width="170" align="center" />
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
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, User, Trophy } from '@element-plus/icons-vue'
import { userApi } from '@/api/user/user'

const route = useRoute()
const router = useRouter()
const userId = Number(route.params.id)

const pageLoading = ref(false)

// User basic info
const user = reactive<Record<string, any>>({})

// Training stats
const stats = reactive<Record<string, any>>({})

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
  fat_loss: '减脂',
  muscle_gain: '增肌',
  toning: '塑形',
  fitness: '提升体能',
  rehabilitation: '康复训练',
  health: '保持健康',
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
    const res = (await userApi.detail(userId)) as any
    Object.assign(user, res.data || {})
  } catch (err: any) {
    ElMessage.error(err.message || '加载用户信息失败')
  } finally {
    pageLoading.value = false
  }
}

async function loadStats() {
  try {
    // Stats are part of the detail response or a separate endpoint
    // Using detail response fields if available, or fetching separately
    const res = (await userApi.detail(userId)) as any
    const data = res.data || {}
    Object.assign(stats, {
      total_workouts: data.total_workouts,
      total_duration: data.total_duration,
      total_volume: data.total_volume,
      streak_days: data.streak_days,
      best_streak: data.best_streak,
    })
  } catch {
    // ignore
  }
}

async function loadAchievements() {
  try {
    const res = (await userApi.getAchievements(userId)) as any
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
    const res = (await userApi.getWorkouts(userId, { page: workoutPage.value, pageSize: 10 })) as any
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
    const res = (await userApi.getAiProfile(userId)) as any
    aiProfile.value = res.data || null
  } catch {
    // ignore
  }
}

async function loadAiChats() {
  try {
    const res = (await userApi.getAiChats(userId, { page: 1, pageSize: 5 })) as any
    aiChats.value = res.data?.list || res.data || []
  } catch {
    // ignore
  }
}

function viewChat(chatId: number) {
  router.push(`/ai/chat/${chatId}`)
}

function viewAllChats() {
  router.push({ path: '/ai/chats', query: { user_id: String(userId) } })
}

// Init
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
