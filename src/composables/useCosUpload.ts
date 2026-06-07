import { ref } from 'vue'
import axios from 'axios'
import request from '@/api/request'

export function useCosUpload() {
  const uploading = ref(false)
  const progress = ref(0)

  async function upload(file: File, dir: string): Promise<string> {
    uploading.value = true
    progress.value = 0
    try {
      // 1. Get presigned URL from backend
      const res = await request.get('/upload/media', { params: { filename: file.name, dir } })
      const { uploadUrl, fileUrl } = (res as { data: { uploadUrl: string; fileUrl: string } }).data

      // 2. Upload directly to COS (no-referrer 避免跨域防盗链拦截)
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (e: { loaded: number; total?: number }) => {
          if (e.total) {
            progress.value = Math.round((e.loaded / e.total) * 100)
          }
        },
      } as Record<string, unknown>)

      return fileUrl
    } finally {
      uploading.value = false
    }
  }

  return { upload, uploading, progress }
}
