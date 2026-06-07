<template>
  <div class="achievement-edit">
    <el-card shadow="never">
      <template #header>
        <span>{{ isEdit ? '编辑成就' : '新增成就' }}</span>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 640px"
      >
        <el-form-item label="成就名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入成就名称" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入成就描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="图标" prop="icon">
          <el-upload
            class="icon-uploader"
            :show-file-list="false"
            :before-upload="beforeIconUpload"
            :http-request="handleIconUpload"
            :disabled="uploading"
            accept="image/*"
          >
            <el-image
              v-if="form.iconUrl"
              :src="form.iconUrl"
              style="width: 80px; height: 80px"
              fit="contain"
            />
            <div v-else-if="uploading" class="icon-uploader-loading">上传中</div>
            <el-icon v-else class="icon-uploader-placeholder"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="条件类型" prop="conditionType">
          <el-select v-model="form.conditionType" placeholder="请选择条件类型" style="width: 100%">
            <el-option
              v-for="(label, value) in conditionTypeMap"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="条件值" prop="conditionValue">
          <el-input-number v-model="form.conditionValue" :min="1" :max="999999" style="width: 100%" />
        </el-form-item>

        <el-form-item label="徽章颜色" prop="badgeColor">
          <el-color-picker v-model="form.badgeColor" show-alpha />
        </el-form-item>

        <el-form-item label="排序权重" prop="sortWeight">
          <el-input-number v-model="form.sortWeight" :min="0" :max="9999" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, UploadRequestOptions } from 'element-plus'
import { achievementApi } from '@/api/achievement/achievement'
import { useQiniuUpload } from '@/composables/useQiniuUpload'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const { upload, uploading } = useQiniuUpload()

const isEdit = computed(() => !!route.params.id)

const conditionTypeMap: Record<string, string> = {
  workout_count: '训练次数',
  total_volume: '总训练量',
  consecutive_days: '连续打卡天数',
  checkin_count: '签到次数',
  plan_completed: '完成计划数',
}

const form = reactive({
  name: '',
  description: '',
  icon: '',
  iconUrl: '',
  conditionType: '',
  conditionValue: 1,
  badgeColor: '#409EFF',
  sortWeight: 0,
})

const rules = {
  name: [{ required: true, message: '请输入成就名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入成就描述', trigger: 'blur' }],
  conditionType: [{ required: true, message: '请选择条件类型', trigger: 'change' }],
  conditionValue: [{ required: true, message: '请输入条件值', trigger: 'blur' }],
}

function beforeIconUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  return true
}

async function handleIconUpload(options: UploadRequestOptions) {
  try {
    const fileUrl = await upload(options.file, 'achievement-icons')
    form.iconUrl = fileUrl
    ElMessage.success('图标上传成功')
  } catch {
    ElMessage.error('图标上传失败')
  }
}

async function loadDetail() {
  if (!route.params.id) return
  try {
    const res = (await achievementApi.detail(Number(route.params.id))) as unknown as {
      data: Record<string, unknown>
    }
    const item = res.data
    if (item) {
      Object.assign(form, {
        name: item.name ?? '',
        description: item.description ?? '',
        iconUrl: item.iconUrl ?? '',
        conditionType: item.conditionType ?? '',
        conditionValue: item.conditionValue ?? 1,
        badgeColor: item.badgeColor ?? '#409EFF',
        sortWeight: item.sortWeight ?? 0,
      })
    }
  } catch {
    ElMessage.error('加载成就详情失败')
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await achievementApi.update(Number(route.params.id), { ...form })
      ElMessage.success('更新成功')
    } else {
      await achievementApi.create({ ...form })
      ElMessage.success('创建成功')
    }
    router.push('/achievement/list')
  } catch {
    // handled by interceptor
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  router.back()
}

watch(
  () => route.params.id,
  () => loadDetail(),
)

onMounted(() => {
  loadDetail()
})
</script>

<style lang="scss" scoped>
.achievement-edit {
  padding: 16px;
}

.icon-uploader {
  :deep(.el-upload) {
    border: 1px dashed #dcdfe6;
    border-radius: 6px;
    cursor: pointer;
    overflow: hidden;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s;

    &:hover {
      border-color: #409eff;
    }
  }

  .icon-uploader-placeholder {
    font-size: 28px;
    color: #8c939d;
  }

  .icon-uploader-loading {
    font-size: 12px;
    color: #409eff;
  }
}
</style>
