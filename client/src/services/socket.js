import { io } from 'socket.io-client'
import { SOCKET_URL } from '../utils/constants'

let socket = null

export const getSocket = () => socket

export const connectSocket = () => {
  if (socket?.connected) {
    return socket
  }

  if (socket) {
    socket.connect()
    return socket
  }

  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
  })

  return socket
}

export const disconnectSocket = () => {
  if (!socket) {
    return
  }

  socket.removeAllListeners()
  socket.disconnect()
  socket = null
}
