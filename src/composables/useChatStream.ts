import { ref, onUnmounted } from 'vue'

interface ChatMessage {
  role: string
  content: string
  timestamp: string
}

export function useChatStream(sessionId: number) {
  const messages = ref<ChatMessage[]>([])
  const status = ref<'connecting' | 'connected' | 'disconnected'>('disconnected')
  let eventSource: EventSource | null = null

  function connect() {
    status.value = 'connecting'
    eventSource = new EventSource(`/api/v1/ai/chat-sessions/${sessionId}/stream`)

    eventSource.onmessage = (event) => {
      messages.value.push(JSON.parse(event.data))
    }

    eventSource.onopen = () => {
      status.value = 'connected'
    }

    eventSource.onerror = () => {
      status.value = 'disconnected'
      // EventSource auto-reconnects after 3s
    }
  }

  function disconnect() {
    eventSource?.close()
    eventSource = null
    status.value = 'disconnected'
  }

  onUnmounted(() => {
    disconnect()
  })

  return { messages, status, connect, disconnect }
}
