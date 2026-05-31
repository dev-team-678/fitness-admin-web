<template>
  <div class="ai-plan-detail-page">
    <el-card shadow="never" class="info-card">
      <template #header>
        <div class="card-header">
          <span>AI 计划详情</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="用户 ID">{{ plan.userId }}</el-descriptions-item>
        <el-descriptions-item label="训练目标">
          <el-tag size="small">{{ goalText(plan.fitnessGoal) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="训练分化">{{ splitText(plan.splitType) }}</el-descriptions-item>
        <el-descriptions-item label="每周天数">{{ plan.daysPerWeek }} 天/周</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(plan.status)" size="small">{{ statusText(plan.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ plan.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="AI 说明" :span="3">
          {{ plan.explanation || '暂无说明' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never" class="weekly-card">
      <template #header>
        <span>周计划安排</span>
      </template>
      <el-table :data="weeklyPlan" border>
        <el-table-column prop="day" label="日期" width="100" />
        <el-table-column prop="focus" label="训练重点" width="140" />
        <el-table-column label="训练内容">
          <template #default="{ row }">
            <div v-for="(exercise, idx) in row.exercises" :key="idx" class="exercise-item">
              <span class="exercise-name">{{ exercise.name }}</span>
              <span class="exercise-detail">
                {{ exercise.sets }}组 x {{ exercise.reps }}{{ exercise.unit === 'seconds' ? '秒' : '次' }}
              </span>
              <el-tag v-if="exercise.isSuperset" size="small" type="warning" class="superset-tag">超级组</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长(min)" width="100" align="center" />
        <el-table-column prop="restDay" label="休息日" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.restDay" size="small" type="info">休息</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never" class="adjustments-card">
      <template #header>
        <span>调整历史</span>
      </template>
      <el-table :data="adjustments" border>
        <el-table-column prop="createdAt" label="日期" width="180" />
        <el-table-column prop="adjustmentReason" label="调整原因" min-width="200" show-overflow-tooltip />
        <el-table-column prop="loadChangePct" label="调整幅度" width="120" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.loadChangePct > 0 ? '#67C23A' : '#F56C6C' }">
              {{ row.loadChangePct > 0 ? '+' : '' }}{{ row.loadChangePct }}%
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never" class="rules-card">
      <template #header>
        <span>微调规则配置</span>
      </template>
      <el-form
        ref="rulesFormRef"
        :model="rulesForm"
        label-width="140px"
        style="max-width: 700px"
      >
        <el-form-item label="自动调整">
          <el-switch v-model="rulesForm.autoAdjust" />
        </el-form-item>
        <el-form-item label="调整触发阈值">
          <el-input-number v-model="rulesForm.threshold" :min="1" :max="100" />
          <span class="form-hint">%</span>
        </el-form-item>
        <el-form-item label="最大单次调整幅度">
          <el-input-number v-model="rulesForm.maxSingleAdjustment" :min="1" :max="50" />
          <span class="form-hint">%</span>
        </el-form-item>
        <el-form-item label="调整冷却期">
          <el-input-number v-model="rulesForm.cooldownDays" :min="1" :max="30" />
          <span class="form-hint">天</span>
        </el-form-item>
        <el-form-item label="疲劳检测">
          <el-switch v-model="rulesForm.fatigueDetection" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="rulesSubmitting" @click="saveRules">保存规则</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { aiPlanApi } from '@/api/ai/ai-plan'
import type { FormInstance } from 'element-plus'

interface Exercise {
  name: string
  sets: number
  reps: number
  unit: string
  isSuperset: boolean
}

interface DayPlan {
  day: string
  focus: string
  exercises: Exercise[]
  duration: number
  restDay: boolean
}

interface Adjustment {
  id: number
  adjustmentReason: string
  loadChangePct: number
  createdAt: string
}

const route = useRoute()
const router = useRouter()
const planId = Number(route.params.id)
const rulesFormRef = ref<FormInstance>()
const rulesSubmitting = ref(false)

const plan = reactive({
  userId: '',
  fitnessGoal: '',
  splitType: '',
  daysPerWeek: 0,
  status: '',
  explanation: '',
  createdAt: '',
})

const weeklyPlan = ref<DayPlan[]>([])
const adjustments = ref<Adjustment[]>([])

const rulesForm = reactive({
  autoAdjust: false,
  threshold: 10,
  maxSingleAdjustment: 10,
  cooldownDays: 3,
  fatigueDetection: true,
})

function goalText(goal: string) {
  const map: Record<string, string> = {
    muscle_gain: '增肌',
    fat_loss: '减脂',
    strength: '力量',
    endurance: '耐力',
    flexibility: '柔韧性',
  }
  return map[goal] || goal
}

function splitText(split: string) {
  const map: Record<string, string> = {
    full_body: '全身',
    upper_lower: '上/下肢',
    push_pull_legs: '推/拉/腿',
    body_part: '身体部位',
  }
  return map[split] || split
}

function statusType(status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined> = {
    pending: 'warning',
    confirmed: 'success',
    active: undefined,
    completed: 'success',
    cancelled: 'info',
  }
  return map[status] || 'info'
}

function statusText(status: string) {
  const map: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    active: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[status] || status
}

async function loadPlan() {
  const res = (await aiPlanApi.detail(planId)) as unknown as {
    data: typeof plan & { workoutDays?: DayPlan[] }
  }
  Object.assign(plan, res.data)
  weeklyPlan.value = res.data.workoutDays || []
}

async function loadAdjustments() {
  const res = (await aiPlanApi.adjustments(planId)) as unknown as { data: Adjustment[] }
  adjustments.value = res.data || []
}

async function loadRules() {
  const res = (await aiPlanApi.getAdjustmentRules()) as unknown as { data: typeof rulesForm }
  if (res.data) {
    Object.assign(rulesForm, res.data)
  }
}

async function saveRules() {
  rulesSubmitting.value = true
  try {
    await aiPlanApi.updateAdjustmentRules({ ...rulesForm })
    ElMessage.success('规则已保存')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    rulesSubmitting.value = false
  }
}

function goBack() {
  router.push('/ai/plans')
}

onMounted(() => {
  loadPlan()
  loadAdjustments()
  loadRules()
})
</script>

<style lang="scss" scoped>
.ai-plan-detail-page {
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

.exercise-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
  font-size: 13px;
}

.exercise-name {
  font-weight: 500;
  color: #303133;
}

.exercise-detail {
  color: #606266;
}

.superset-tag {
  margin-left: 4px;
}

.form-hint {
  margin-left: 8px;
  color: #909399;
  font-size: 13px;
}
</style>
