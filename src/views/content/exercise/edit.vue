<template>
  <div class="exercise-edit-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑动作' : '新增动作' }}</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 900px"
      >
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="动作名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入动作名称" maxlength="50" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="英文名" prop="name_en">
              <el-input v-model="form.name_en" placeholder="英文名称" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="所属分类" prop="category_id">
          <el-select v-model="form.category_id" placeholder="请选择分类" style="width: 240px">
            <el-option
              v-for="cat in categoryOptions"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="难度" prop="difficulty">
          <el-radio-group v-model="form.difficulty">
            <el-radio-button :value="1">初级</el-radio-button>
            <el-radio-button :value="2">中级</el-radio-button>
            <el-radio-button :value="3">高级</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="动作类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio-button value="strength">力量</el-radio-button>
            <el-radio-button value="cardio">有氧</el-radio-button>
            <el-radio-button value="flexibility">柔韧</el-radio-button>
            <el-radio-button value="balance">平衡</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="器械" prop="equipment">
          <el-radio-group v-model="form.equipment">
            <el-radio-button value="none">无器械</el-radio-button>
            <el-radio-button value="dumbbell">哑铃</el-radio-button>
            <el-radio-button value="barbell">杠铃</el-radio-button>
            <el-radio-button value="machine">固定器械</el-radio-button>
            <el-radio-button value="band">弹力带</el-radio-button>
            <el-radio-button value="other">其他</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="目标肌群">
          <div class="muscle-selector">
            <div class="muscle-row">
              <span class="muscle-label">主要肌群：</span>
              <el-select
                v-model="form.primary_muscles"
                multiple
                filterable
                placeholder="选择主要肌群"
                style="flex: 1"
              >
                <el-option
                  v-for="bp in bodyPartOptions"
                  :key="bp.id"
                  :label="bp.name"
                  :value="bp.name"
                />
              </el-select>
            </div>
            <div class="muscle-row">
              <span class="muscle-label">辅助肌群：</span>
              <el-select
                v-model="form.secondary_muscles"
                multiple
                filterable
                placeholder="选择辅助肌群"
                style="flex: 1"
              >
                <el-option
                  v-for="bp in bodyPartOptions"
                  :key="bp.id"
                  :label="bp.name"
                  :value="bp.name"
                />
              </el-select>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="复合动作">
          <el-switch v-model="form.is_compound" />
        </el-form-item>

        <el-form-item label="动作描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入动作描述"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <!-- Steps -->
        <el-form-item label="动作步骤">
          <div class="dynamic-list">
            <div v-for="(step, index) in form.steps" :key="index" class="dynamic-item">
              <span class="step-number">{{ index + 1 }}.</span>
              <el-input
                v-model="form.steps[index]"
                placeholder="描述步骤"
                style="flex: 1"
              />
              <el-button
                link
                type="danger"
                @click="form.steps.splice(index, 1)"
              >
                删除
              </el-button>
            </div>
            <el-button type="primary" link @click="form.steps.push('')">
              <el-icon><Plus /></el-icon>
              添加步骤
            </el-button>
          </div>
        </el-form-item>

        <!-- Precautions -->
        <el-form-item label="注意事项">
          <div class="dynamic-list">
            <div v-for="(item, index) in form.precautions" :key="index" class="dynamic-item">
              <el-input
                v-model="form.precautions[index]"
                placeholder="描述注意事项"
                style="flex: 1"
              />
              <el-button
                link
                type="danger"
                @click="form.precautions.splice(index, 1)"
              >
                删除
              </el-button>
            </div>
            <el-button type="primary" link @click="form.precautions.push('')">
              <el-icon><Plus /></el-icon>
              添加注意事项
            </el-button>
          </div>
        </el-form-item>

        <!-- Media Upload -->
        <el-form-item label="示范图片">
          <el-upload
            class="media-uploader"
            :show-file-list="false"
            :http-request="(opt) => handleMediaUpload(opt, 'image')"
            accept="image/*"
          >
            <img v-if="form.demo_image_url" :src="form.demo_image_url" class="media-preview" />
            <el-icon v-else class="media-placeholder"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="示范视频">
          <el-upload
            class="media-uploader"
            :show-file-list="false"
            :http-request="(opt) => handleMediaUpload(opt, 'video')"
            accept="video/*"
          >
            <video
              v-if="form.demo_video_url"
              :src="form.demo_video_url"
              class="media-preview"
              controls
            />
            <el-icon v-else class="media-placeholder"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="每次卡路里">
              <el-input-number
                v-model="form.calories_per_rep"
                :min="0"
                :max="1000"
                :precision="1"
                :step="0.5"
              />
              <span class="unit-hint">千卡/次</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="每分钟卡路里">
              <el-input-number
                v-model="form.calories_per_minute"
                :min="0"
                :max="100"
                :precision="1"
                :step="0.5"
              />
              <span class="unit-hint">千卡/分钟</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- Bottom Actions -->
    <div class="page-footer">
      <el-button @click="goBack">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">
        {{ isEdit ? '保存修改' : '创建动作' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, UploadRequestOptions } from 'element-plus'
import { exerciseApi } from '@/api/content/exercise'
import { categoryApi } from '@/api/content/category'
import { bodyPartApi } from '@/api/content/body-part'
import { useCosUpload } from '@/composables/useCosUpload'

const route = useRoute()
const router = useRouter()
const { upload } = useCosUpload()

const isEdit = computed(() => !!route.params.id)
const formRef = ref<FormInstance>()
const saving = ref(false)

const form = reactive({
  name: '',
  name_en: '',
  category_id: null as number | null,
  difficulty: 1,
  type: 'strength',
  equipment: 'none',
  primary_muscles: [] as string[],
  secondary_muscles: [] as string[],
  is_compound: false,
  description: '',
  steps: [''] as string[],
  precautions: [''] as string[],
  demo_image_url: '',
  demo_video_url: '',
  calories_per_rep: 0,
  calories_per_minute: 0,
})

const rules = {
  name: [{ required: true, message: '请输入动作名称', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  equipment: [{ required: true, message: '请选择器械', trigger: 'change' }],
}

const categoryOptions = ref<{ id: number; name: string }[]>([])
const bodyPartOptions = ref<{ id: number; name: string }[]>([])

async function handleMediaUpload(options: UploadRequestOptions, type: 'image' | 'video') {
  const dir = type === 'image' ? 'exercise-images' : 'exercise-videos'
  try {
    const url = await upload(options.file, dir)
    if (type === 'image') {
      form.demo_image_url = url
    } else {
      form.demo_video_url = url
    }
    ElMessage.success('上传成功')
  } catch {
    ElMessage.error('上传失败')
  }
}

async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  // Filter empty steps and precautions
  const payload = {
    ...form,
    steps: form.steps.filter((s) => s.trim()),
    precautions: form.precautions.filter((p) => p.trim()),
    target_muscles: [...form.primary_muscles, ...form.secondary_muscles],
  }

  saving.value = true
  try {
    if (isEdit.value) {
      await exerciseApi.update(Number(route.params.id), payload)
      ElMessage.success('保存成功')
    } else {
      await exerciseApi.create(payload)
      ElMessage.success('创建成功')
    }
    router.push('/exercise/list')
  } catch {
    // handled by interceptor
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push('/exercise/list')
}

async function loadOptions() {
  try {
    const [catRes, bpRes] = await Promise.all([
      categoryApi.list(),
      bodyPartApi.list(),
    ])
    categoryOptions.value = (catRes as any).data || []
    bodyPartOptions.value = (bpRes as any).data || []
  } catch {
    // handled by interceptor
  }
}

async function loadDetail() {
  if (!isEdit.value) return
  try {
    const res = await exerciseApi.detail(Number(route.params.id)) as any
    const data = res.data
    Object.assign(form, {
      name: data.name || '',
      name_en: data.name_en || '',
      category_id: data.category_id,
      difficulty: data.difficulty || 1,
      type: data.type || 'strength',
      equipment: data.equipment || 'none',
      primary_muscles: data.primary_muscles || [],
      secondary_muscles: data.secondary_muscles || [],
      is_compound: data.is_compound || false,
      description: data.description || '',
      steps: data.steps?.length ? data.steps : [''],
      precautions: data.precautions?.length ? data.precautions : [''],
      demo_image_url: data.demo_image_url || '',
      demo_video_url: data.demo_video_url || '',
      calories_per_rep: data.calories_per_rep || 0,
      calories_per_minute: data.calories_per_minute || 0,
    })
  } catch {
    // handled by interceptor
  }
}

onMounted(() => {
  loadOptions()
  loadDetail()
})
</script>

<style lang="scss" scoped>
.exercise-edit-page {
  padding: 16px;
  padding-bottom: 80px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.muscle-selector {
  width: 100%;

  .muscle-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .muscle-label {
      white-space: nowrap;
      color: #606266;
      font-size: 13px;
      min-width: 80px;
    }
  }
}

.dynamic-list {
  width: 100%;

  .dynamic-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .step-number {
      color: #909399;
      font-size: 13px;
      min-width: 20px;
    }
  }
}

.media-uploader {
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

  .media-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .media-placeholder {
    font-size: 28px;
    color: #8c939d;
  }
}

.unit-hint {
  margin-left: 8px;
  color: #909399;
  font-size: 13px;
}

.page-footer {
  position: fixed;
  bottom: 0;
  left: 200px;
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
