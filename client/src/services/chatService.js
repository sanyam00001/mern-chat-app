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
