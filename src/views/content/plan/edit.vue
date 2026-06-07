<template>
  <div class="plan-edit-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑计划' : '创建计划' }}</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="110px"
        style="max-width: 900px"
      >
        <el-form-item label="计划名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入计划名称" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item label="难度" prop="fitnessLevel">
          <el-radio-group v-model="form.fitnessLevel">
            <el-radio-button value="beginner">初级</el-radio-button>
            <el-radio-button value="intermediate">中级</el-radio-button>
            <el-radio-button value="advanced">高级</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="训练目标" prop="fitnessGoal">
          <el-select v-model="form.fitnessGoal" placeholder="请选择训练目标" style="width: 240px">
            <el-option label="增肌" value="muscle_gain" />
            <el-option label="减脂" value="fat_loss" />
            <el-option label="塑形" value="toning" />
            <el-option label="力量" value="strength" />
            <el-option label="耐力" value="endurance" />
            <el-option label="灵活性" value="flexibility" />
          </el-select>
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="周数" prop="durationWeeks">
              <el-input-number v-model="form.durationWeeks" :min="1" :max="52" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="每周天数" prop="daysPerWeek">
              <el-input-number v-model="form.daysPerWeek" :min="1" :max="7" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="平均时长(分)" prop="avgDurationMin">
              <el-input-number v-model="form.avgDurationMin" :min="5" :max="300" :step="5" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="封面图片">
          <el-upload
            class="cover-uploader"
            :show-file-list="false"
            :http-request="handleCoverUpload"
            accept="image/*"
          >
            <img v-if="form.coverImage" :src="form.coverImage" class="cover-preview" />
            <el-icon v-else class="cover-placeholder"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="计划描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入计划描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Week Plan Editor -->
    <el-card shadow="never" class="week-plan-card">
      <template #header>
        <div class="card-header">
          <span>训练安排</span>
          <div>
            <el-select
              v-model="currentWeek"
              placeholder="选择周次"
              style="width: 120px; margin-right: 8px"
            >
              <el-option
                v-for="w in form.weeks"
                :key="w"
                :label="`第 ${w} 周`"
                :value="w"
              />
            </el-select>
          </div>
        </div>
      </template>

      <!-- 7-day grid -->
      <div class="week-grid">
        <div
          v-for="day in weekDays"
          :key="day.index"
          class="day-cell"
          :class="{ active: editingDayIndex === day.index, rest: !getDayPlan(day.index).exercises.length }"
          @click="openDayEditor(day.index)"
        >
          <div class="day-header">{{ day.label }}</div>
          <div class="day-content">
            <template v-if="getDayPlan(day.index).exercises.length">
              <div class="day-summary">
                {{ getDayPlan(day.index).exercises.length }} 个动作
              </div>
              <div
                v-for="(ex, i) in getDayPlan(day.index).exercises.slice(0, 3)"
                :key="i"
                class="exercise-preview"
              >
                {{ ex.exercise_name || `动作 ${i + 1}` }}
              </div>
              <div
                v-if="getDayPlan(day.index).exercises.length > 3"
                class="more-hint"
              >
                +{{ getDayPlan(day.index).exercises.length - 3 }} 更多
              </div>
            </template>
            <div v-else class="rest-label">休息</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Day Editor Drawer -->
    <el-drawer
      v-model="dayDrawerVisible"
      :title="`编辑 - ${weekDays[editingDayIndex]?.label || ''}`"
      size="680px"
      destroy-on-close
    >
      <div class="day-editor">
        <div class="day-editor-toolbar">
          <el-button type="primary" size="small" @click="openExerciseSelector">
            <el-icon><Plus /></el-icon>
            添加动作
          </el-button>
        </div>

        <el-table :data="currentDayExercises" border size="small">
          <el-table-column type="index" label="#" width="50" />
          <el-table-column prop="exercise_name" label="动作名称" min-width="140" />
          <el-table-column label="组数" width="80">
            <template #default="{ row }">
              <el-input-number
                v-model="row.sets"
                :min="1"
                :max="20"
                size="small"
                controls-position="right"
              />
            </template>
          </el-table-column>
          <el-table-column label="次数" width="80">
            <template #default="{ row }">
              <el-input v-model="row.reps" size="small" placeholder="如12" />
            </template>
          </el-table-column>
          <el-table-column label="休息(秒)" width="90">
            <template #default="{ row }">
              <el-input-number
                v-model="row.rest_seconds"
                :min="0"
                :max="600"
                :step="15"
                size="small"
                controls-position="right"
              />
            </template>
          </el-table-column>
          <el-table-column label="备注" min-width="120">
            <template #default="{ row }">
              <el-input v-model="row.notes" size="small" placeholder="备注" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ $index }">
              <el-button
                link
                type="primary"
                size="small"
                :disabled="$index === 0"
                @click="moveExerciseUp($index)"
              >
                上移
              </el-button>
              <el-button
                link
                type="danger"
                size="small"
                @click="removeExercise($index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <el-button @click="dayDrawerVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDay">保存当天</el-button>
      </template>
    </el-drawer>

    <!-- Exercise Selector Dialog -->
    <el-dialog
      v-model="exerciseDialogVisible"
      title="选择动作"
      width="700px"
      destroy-on-close
    >
      <div class="exercise-selector">
        <el-input
          v-model="exerciseSearch"
          placeholder="搜索动作名称"
          clearable
          style="margin-bottom: 12px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-table
          :data="filteredExercises"
          border
          size="small"
          max-height="400px"
          @selection-change="handleExerciseSelection"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="name" label="动作名称" min-width="120" />
          <el-table-column prop="name_en" label="英文名" min-width="120" />
          <el-table-column prop="type" label="类型" width="80">
            <template #default="{ row }">
              {{ typeLabel(row.type) }}
            </template>
          </el-table-column>
          <el-table-column prop="equipment" label="器械" width="90">
            <template #default="{ row }">
              {{ equipmentLabel(row.equipment) }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <el-button @click="exerciseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExerciseSelection">
          确认添加 ({{ selectedExercises.length }})
        </el-button>
      </template>
    </el-dialog>

    <!-- Bottom Actions -->
    <div class="page-footer">
      <el-button @click="goBack">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">
        {{ isEdit ? '保存修改' : '创建计划' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import type { FormInstance, UploadRequestOptions } from 'element-plus'
import { planApi } from '@/api/content/plan'
import { exerciseApi } from '@/api/content/exercise'
import { useCosUpload } from '@/composables/useCosUpload'

interface DayExercise {
  exercise_id: number
  exercise_name: string
  sets: number
  reps: string
  rest_seconds: number
  notes: string
}

interface DayPlan {
  focus?: string
  exercises: DayExercise[]
}

const route = useRoute()
const router = useRouter()
const { upload } = useCosUpload()

const isEdit = computed(() => !!route.params.id)
const formRef = ref<FormInstance>()
const saving = ref(false)
const currentWeek = ref(1)

// Form
const form = reactive({
  name: '',
  fitnessLevel: 'intermediate',
  fitnessGoal: '',
  durationWeeks: 4,
  daysPerWeek: 3,
  avgDurationMin: 45,
  coverImage: '',
  description: '',
  weeks: 4 as number,
})

const rules = {
  name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
  fitnessLevel: [{ required: true, message: '请选择难度', trigger: 'change' }],
  fitnessGoal: [{ required: true, message: '请选择训练目标', trigger: 'change' }],
  durationWeeks: [{ required: true, message: '请输入周数', trigger: 'blur' }],
  daysPerWeek: [{ required: true, message: '请输入每周天数', trigger: 'blur' }],
}

// Week plan data: weekPlans[week][day] = DayPlan
const weekPlans = ref<Record<number, Record<number, DayPlan>>>({})

const weekDays = [
  { index: 0, label: '周一' },
  { index: 1, label: '周二' },
  { index: 2, label: '周三' },
  { index: 3, label: '周四' },
  { index: 4, label: '周五' },
  { index: 5, label: '周六' },
  { index: 6, label: '周日' },
]

function getDayPlan(dayIndex: number): DayPlan {
  return weekPlans.value[currentWeek.value]?.[dayIndex] || { exercises: [] }
}

// Day editor
const dayDrawerVisible = ref(false)
const editingDayIndex = ref(0)
const currentDayExercises = ref<DayExercise[]>([])

function openDayEditor(dayIndex: number) {
  editingDayIndex.value = dayIndex
  currentDayExercises.value = JSON.parse(JSON.stringify(getDayPlan(dayIndex).exercises))
  dayDrawerVisible.value = true
}

function saveDay() {
  if (!weekPlans.value[currentWeek.value]) {
    weekPlans.value[currentWeek.value] = {}
  }
  weekPlans.value[currentWeek.value][editingDayIndex.value] = {
    exercises: JSON.parse(JSON.stringify(currentDayExercises.value)),
  }
  dayDrawerVisible.value = false
  ElMessage.success('已保存')
}

function moveExerciseUp(index: number) {
  if (index <= 0) return
  const list = currentDayExercises.value
  ;[list[index - 1], list[index]] = [list[index], list[index - 1]]
}

function removeExercise(index: number) {
  currentDayExercises.value.splice(index, 1)
}

// Exercise selector
const exerciseDialogVisible = ref(false)
const exerciseSearch = ref('')
const exerciseLibrary = ref<any[]>([])
const selectedExercises = ref<any[]>([])

function typeLabel(val: string) {
  const map: Record<string, string> = { strength: '力量', cardio: '有氧', flexibility: '柔韧', balance: '平衡', compound: '复合' }
  return map[val] || val || '-'
}

function equipmentLabel(val: string) {
  const map: Record<string, string> = { none: '无器械', dumbbell: '哑铃', barbell: '杠铃', machine: '固定器械', band: '弹力带', other: '其他' }
  return map[val] || val || '-'
}

const filteredExercises = computed(() => {
  if (!exerciseSearch.value) return exerciseLibrary.value
  const keyword = exerciseSearch.value.toLowerCase()
  return exerciseLibrary.value.filter(
    (e) =>
      e.name?.toLowerCase().includes(keyword) ||
      e.name_en?.toLowerCase().includes(keyword),
  )
})

async function openExerciseSelector() {
  exerciseDialogVisible.value = true
  exerciseSearch.value = ''
  selectedExercises.value = []
  if (!exerciseLibrary.value.length) {
    try {
      const res = await exerciseApi.list({ pageNum: 1, pageSize: 500 }) as any
      exerciseLibrary.value = res.data?.list || []
    } catch {
      // handled by interceptor
    }
  }
}

function handleExerciseSelection(selection: any[]) {
  selectedExercises.value = selection
}

function confirmExerciseSelection() {
  for (const ex of selectedExercises.value) {
    currentDayExercises.value.push({
      exercise_id: ex.id,
      exercise_name: ex.name,
      sets: 3,
      reps: '12',
      rest_seconds: 60,
      notes: '',
    })
  }
  exerciseDialogVisible.value = false
  ElMessage.success(`已添加 ${selectedExercises.value.length} 个动作`)
}

// Cover upload
async function handleCoverUpload(options: UploadRequestOptions) {
  try {
    const url = await upload(options.file, 'plan-covers')
    form.coverImage = url
    ElMessage.success('上传成功')
  } catch {
    ElMessage.error('上传失败')
  }
}

// Save
async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  // Build days array for API (PlanCreateDTO expects flat days list)
  const daysArr: any[] = []
  for (let w = 1; w <= form.durationWeeks; w++) {
    const weekData = weekPlans.value[w] || {}
    for (let d = 0; d < 7; d++) {
      const dayPlan = weekData[d]
      daysArr.push({
        weekNumber: w,
        dayNumber: d + 1,
        focus: dayPlan?.focus || '',
        exercises: (dayPlan?.exercises || []).map((ex: any, idx: number) => ({
          exerciseId: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          restSeconds: ex.rest_seconds,
          sort: idx,
        })),
      })
    }
  }

  saving.value = true
  try {
    const payload = { ...form, days: daysArr }
    if (isEdit.value) {
      await planApi.update(Number(route.params.id), payload)
      ElMessage.success('保存成功')
    } else {
      await planApi.create(payload)
      ElMessage.success('创建成功')
    }
    router.push('/content/plan/list')
  } catch {
    // handled by interceptor
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push('/content/plan/list')
}

// Load detail for edit
async function loadDetail() {
  if (!isEdit.value) return
  try {
    const res = await planApi.detail(Number(route.params.id)) as any
    const data = res.data
    Object.assign(form, {
      name: data.name,
      fitnessLevel: data.difficultyLevel || 'intermediate',
      fitnessGoal: data.fitnessGoal || '',
      durationWeeks: data.durationWeeks || 4,
      daysPerWeek: data.daysPerWeek || 3,
      avgDurationMin: data.avgDurationMin || 45,
      coverImage: data.coverImageUrl || '',
      description: data.description || '',
      weeks: data.durationWeeks || 4,
    })
    // Parse days into weekPlans structure
    if (data.days) {
      const plans: Record<number, Record<number, DayPlan>> = {}
      for (const day of data.days) {
        const week = day.weekNumber || 1
        const dayIndex = (day.dayOfWeek || 1) - 1
        if (!plans[week]) plans[week] = {}
        plans[week][dayIndex] = {
          focus: day.dayLabel || '',
          exercises: (day.exercises || []).map((ex: any) => ({
            exercise_id: ex.exerciseId,
            exercise_name: ex.exerciseName || '',
            sets: ex.sets || 3,
            reps: String(ex.reps || '12'),
            rest_seconds: ex.restSeconds || 60,
            notes: ex.notes || '',
          })),
        }
      }
      weekPlans.value = plans
    }
  } catch {
    // handled by interceptor
  }
}

// Keep weekPlans in sync with form.weeks
watch(
  () => form.weeks,
  (val) => {
    if (currentWeek.value > val) currentWeek.value = val
  },
)

watch(
  () => route.params.id,
  () => loadDetail(),
)

onMounted(() => {
  loadDetail()
})
</script>

<style lang="scss" scoped>
.plan-edit-page {
  padding: 16px;
  padding-bottom: 80px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.week-plan-card {
  margin-top: 16px;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-cell {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.2s;
  min-height: 140px;

  &:hover {
    border-color: #409eff;
  }

  &.active {
    border-color: #409eff;
    box-shadow: 0 0 0 1px #409eff;
  }

  &.rest {
    background: #fafafa;
  }

  .day-header {
    background: #f5f7fa;
    padding: 6px 10px;
    font-weight: 600;
    font-size: 13px;
    border-bottom: 1px solid #e4e7ed;
    border-radius: 6px 6px 0 0;
  }

  .day-content {
    padding: 8px 10px;
    font-size: 12px;
  }

  .day-summary {
    color: #409eff;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .exercise-preview {
    color: #606266;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.6;
  }

  .more-hint {
    color: #909399;
    font-size: 11px;
    margin-top: 2px;
  }

  .rest-label {
    color: #c0c4cc;
    text-align: center;
    padding: 20px 0;
  }
}

.day-editor {
  .day-editor-toolbar {
    margin-bottom: 12px;
  }
}

.exercise-selector {
  :deep(.el-table) {
    .el-table__row {
      cursor: pointer;
    }
  }
}

.cover-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    overflow: hidden;
    width: 200px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: #409eff;
    }
  }

  .cover-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cover-placeholder {
    font-size: 28px;
    color: #8c939d;
  }
}

.page-footer {
  position: fixed;
  bottom: 0;
  left: 200px; // sidebar width
  right: 0;
  background: #fff;
  padding: 12px 24px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  z-index: 100;
}
</style>
