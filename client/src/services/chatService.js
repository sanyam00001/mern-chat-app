import api from './api'

export const searchUsers = async (search) => {
  const { data } = await api.get('/chat/users', { params: { search } })
  return data
}

export const createOrFindConversation = async (recipientId) => {
  const { data } = await api.post('/chat/conversations', { recipientId })
  return data
}

export const getConversations = async () => {
  const { data } = await api.get('/chat/conversations')
  return data
}

export const getMessages = async (conversationId, { page = 1, limit = 50 } = {}) => {
  const { data } = await api.get(`/chat/conversations/${conversationId}/messages`, {
    params: { page, limit },
  })
  return data
}

export const sendMessage = async (conversationId, content) => {
  const { data } = await api.post(`/chat/conversations/${conversationId}/messages`, {
    content,
  })
  return data
}

export const sendMediaMessage = async (
  conversationId,
  { file, content = '', onProgress } = {},
) => {
  const formData = new FormData()
  formData.append('file', file)

  if (content) {
    formData.append('content', content)
  }

  const { data } = await api.post(
    `/chat/conversations/${conversationId}/messages`,
    formData,
    {
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) {
          return
        }

        onProgress(Math.round((event.loaded * 100) / event.total))
      },
    },
  )

  return data
}

export const fetchAttachmentBlob = async (attachmentUrl) => {
  const { data } = await api.get(attachmentUrl, {
    responseType: 'blob',
  })

  return data
}

export const downloadAttachment = async (attachmentUrl, filename) => {
  const blob = await fetchAttachmentBlob(attachmentUrl)
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = objectUrl
  link.download = filename || 'download'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

export const markConversationAsRead = async (conversationId) => {
  const { data } = await api.patch(`/chat/conversations/${conversationId}/read`)
  return data
}
