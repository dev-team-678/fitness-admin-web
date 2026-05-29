<template>
  <div class="chat-detail-page">
    <el-card shadow="never" class="session-info-card">
      <template #header>
        <div class="card-header">
          <span>会话详情</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>
      <el-descriptions :column="4" border>
        <el-descriptions-item label="会话ID">{{ session.sessionId }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ session.userName }}</el-descriptions-item>
        <el-descriptions-item label="消息数">{{ session.messageCount }}</el-descriptions-item>
        <el-descriptions-item label="反馈">
          <span class="feedback-info">
            <el-icon color="#67C23A"><Top /></el-icon> {{ session.thumbsUp }}
            <el-icon color="#F56C6C" style="margin-left: 12px"><Bottom /></el-icon> {{ session.thumbsDown }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="session.status === 'active' ? 'success' : 'info'" size="small">
            {{ session.status === 'active' ? '进行中' : '已结束' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ session.startTime }}</el-descriptions-item>
        <el-descriptions-item label="最后消息">{{ session.lastMessageTime }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never" class="messages-card">
      <template #header>
        <span>消息记录</span>
      </template>

      <div v-loading="messagesLoading" class="message-list">
        <div v-for="msg in messages" :key="msg.id" :class="['message-item', msg.role]">
          <div class="message-avatar">
            <el-avatar :size="36" :style="{ background: msg.role === 'user' ? '#409EFF' : '#6C5CE7' }">
              {{ msg.role === 'user' ? 'U' : 'AI' }}
            </el-avatar>
          </div>
          <div class="message-body">
            <div class="message-meta">
              <span class="role-name">{{ msg.role === 'user' ? '用户' : 'AI 助手' }}</span>
              <span class="msg-time">{{ msg.createdAt }}</span>
            </div>
            <div class="message-content">{{ msg.content }}</div>

            <div v-if="msg.role === 'assistant' && msg.ragReferences?.length" class="rag-references">
              <div class="rag-title">RAG 引用：</div>
              <div v-for="ref in msg.ragReferences" :key="ref.id" class="rag-item">
                <el-tag size="small" type="success">相关度 {{ (ref.score * 100).toFixed(0) }}%</el-tag>
                <span class="rag-item-title">{{ ref.title }}</span>
                <el-tag size="small" type="info">{{ ref.categoryName }}</el-tag>
              </div>
            </div>

            <div v-if="msg.role === 'assistant'" class="message-actions">
              <el-button size="small" type="danger" plain @click="handleMarkIssue(msg)">
                标记问题
              </el-button>
              <el-button size="small" type="warning" plain @click="handleCorrection(msg)">
                提供纠正
              </el-button>
              <el-button size="small" type="primary" plain @click="handleAddToKnowledge(msg)">
                加入知识库
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog v-model="issueDialogVisible" title="标记问题" width="480px">
      <el-form label-width="80px">
        <el-form-item label="问题原因">
          <el-input
            v-model="issueReason"
            type="textarea"
            :rows="3"
            placeholder="请描述该回答存在的问题"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="issueDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="issueSubmitting" @click="submitIssue">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="correctionDialogVisible" title="提供纠正" width="480px">
      <el-form label-width="80px">
        <el-form-item label="纠正内容">
          <el-input
            v-model="correctionContent"
            type="textarea"
            :rows="4"
            placeholder="请输入正确的回答内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="correctionDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="correctionSubmitting" @click="submitCorrection">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Top, Bottom } from '@element-plus/icons-vue'
import { chatMonitorApi } from '@/api/ai/chat-monitor'

interface RagReference {
  id: number
  title: string
  categoryName: string
  score: number
}

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  ragReferences?: RagReference[]
}

const route = useRoute()
const router = useRouter()
const sessionId = Number(route.params.id)

const session = reactive({
  sessionId: '',
  userName: '',
  messageCount: 0,
  thumbsUp: 0,
  thumbsDown: 0,
  status: '',
  startTime: '',
  lastMessageTime: '',
})

const messages = ref<Message[]>([])
const messagesLoading = ref(false)

const issueDialogVisible = ref(false)
const issueReason = ref('')
const issueSubmitting = ref(false)
const currentIssueMsg = ref<Message | null>(null)

const correctionDialogVisible = ref(false)
const correctionContent = ref('')
const correctionSubmitting = ref(false)
const currentCorrectionMsg = ref<Message | null>(null)

async function loadSession() {
  const res = (await chatMonitorApi.sessionDetail(sessionId)) as unknown as { data: typeof session }
  Object.assign(session, res.data)
}

async function loadMessages() {
  messagesLoading.value = true
  try {
    const res = (await chatMonitorApi.messages(sessionId)) as unknown as { data: Message[] }
    messages.value = res.data || []
  } finally {
    messagesLoading.value = false
  }
}

function handleMarkIssue(msg: Message) {
  currentIssueMsg.value = msg
  issueReason.value = ''
  issueDialogVisible.value = true
}

async function submitIssue() {
  if (!issueReason.value.trim()) {
    ElMessage.warning('请填写问题原因')
    return
  }
  issueSubmitting.value = true
  try {
    await chatMonitorApi.markIssue(sessionId, currentIssueMsg.value!.id, { reason: issueReason.value })
    ElMessage.success('已标记问题')
    issueDialogVisible.value = false
  } catch {
    ElMessage.error('标记失败')
  } finally {
    issueSubmitting.value = false
  }
}

function handleCorrection(msg: Message) {
  currentCorrectionMsg.value = msg
  correctionContent.value = ''
  correctionDialogVisible.value = true
}

async function submitCorrection() {
  if (!correctionContent.value.trim()) {
    ElMessage.warning('请输入纠正内容')
    return
  }
  correctionSubmitting.value = true
  try {
    await chatMonitorApi.updateIssue(sessionId, currentCorrectionMsg.value!.id, {
      correction: correctionContent.value,
    })
    ElMessage.success('纠正已提交')
    correctionDialogVisible.value = false
  } catch {
    ElMessage.error('提交失败')
  } finally {
    correctionSubmitting.value = false
  }
}

async function handleAddToKnowledge(msg: Message) {
  try {
    await chatMonitorApi.toKnowledge(sessionId, msg.id)
    ElMessage.success('已加入知识库')
  } catch {
    ElMessage.error('操作失败')
  }
}

function goBack() {
  router.push('/ai/chat-monitor')
}

onMounted(() => {
  loadSession()
  loadMessages()
})
</script>

<style lang="scss" scoped>
.chat-detail-page {
  padding: 16px;
}

.session-info-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.feedback-info {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.message-list {
  max-height: 70vh;
  overflow-y: auto;
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;

  &.assistant {
    flex-direction: row;
  }

  &.user {
    flex-direction: row-reverse;

    .message-body {
      align-items: flex-end;
    }

    .message-content {
      background: #ecf5ff;
      border-color: #d9ecff;
    }
  }
}

.message-body {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 12px;
  color: #909399;
}

.role-name {
  font-weight: 500;
}

.message-content {
  padding: 10px 14px;
  background: #f4f4f5;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.rag-references {
  margin-top: 8px;
  padding: 8px 12px;
  background: #faf0e6;
  border: 1px solid #f5dab1;
  border-radius: 6px;
  font-size: 13px;

  .rag-title {
    font-weight: 500;
    color: #909399;
    margin-bottom: 6px;
  }
}

.rag-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;

  .rag-item-title {
    color: #303133;
  }
}

.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
</style>
