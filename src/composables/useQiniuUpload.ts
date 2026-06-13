import { ref } from 'vue'
import axios from 'axios'
import request from '@/api/request'

export function useQiniuUpload() {
  const uploading = ref(false)
  const progress = ref(0)

  async function upload(file: File, dir: string): Promise<string> {
    uploading.value = true
    progress.value = 0
    try {
      // 1. 从后端获取七牛云上传凭证
      const res = await request.get<{ uploadToken: string; key: string; uploadDomain: string; fileUrl: string }>(
        '/upload/media',
        { params: { filename: file.name, dir } }
      )
      const { uploadToken, key, uploadDomain, fileUrl } = res.data

      // 2. 构建 FormData 直传七牛云
      const formData = new FormData()
      formData.append('file', file)
      formData.append('token', uploadToken)
      formData.append('key', key)

      await axios.post(uploadDomain, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e: { loaded: number; total?: number }) => {
          if (e.total) {
            progress.value = Math.round((e.loaded / e.total) * 100)
          }
        },
      })

      return fileUrl
    } finally {
      uploading.value = false
    }
  }

  return { upload, uploading, progress }
}
