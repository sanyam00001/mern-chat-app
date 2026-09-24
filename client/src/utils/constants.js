export const APP_NAME = 'MERN Chat'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api\/?$/, '')

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.txt', '.csv', '.zip', '.docx', '.xlsx']

export const ALLOWED_UPLOAD_EXTENSIONS = [
  ...ALLOWED_IMAGE_EXTENSIONS,
  ...ALLOWED_FILE_EXTENSIONS,
]

export const UPLOAD_ACCEPT =
  'image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.csv,.zip,.docx,.xlsx'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CHAT: '/chat',
}

export const SOCKET_EVENTS = {
  MESSAGE_SEND: 'message:send',
  MESSAGE_NEW: 'message:new',
  MESSAGE_ERROR: 'message:error',
  CONVERSATION_JOIN: 'conversation:join',
  CONVERSATION_UPDATED: 'conversation:updated',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  PRESENCE_SNAPSHOT: 'presence:snapshot',
  PRESENCE_UPDATE: 'presence:update',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
}
