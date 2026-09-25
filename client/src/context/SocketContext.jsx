import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAuth } from '../hooks/useAuth'
import { connectSocket, disconnectSocket, getSocket } from '../services/socket'
import { SOCKET_EVENTS } from '../utils/constants'
import { getConversations } from '../services/chatService'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [onlineUserIds, setOnlineUserIds] = useState(() => new Set())
  const reconnectRefreshRef = useRef(null)
  const hasConnectedOnceRef = useRef(false)
  const activeConversationIdRef = useRef(null)
  const [unreadCounts, setUnreadCounts] = useState({})

  const setReconnectHandler = useCallback((handler) => {
    reconnectRefreshRef.current = handler
  }, [])

  const setActiveConversation = useCallback((conversationId) => {
    activeConversationIdRef.current = conversationId
  }, [])

  useEffect(() => {
    if (!user) {
      disconnectSocket()
      setSocket(null)
      setConnected(false)
      setOnlineUserIds(new Set())
      hasConnectedOnceRef.current = false
      return undefined
    }

    const instance = connectSocket()
    setSocket(instance)

    const handleConnect = () => {
      setConnected(true)

      if (hasConnectedOnceRef.current) {
        reconnectRefreshRef.current?.()
      }

      hasConnectedOnceRef.current = true
    }

    const handleDisconnect = () => {
      setConnected(false)
    }

    const handleSnapshot = ({ onlineUserIds: ids = [] }) => {
      setOnlineUserIds(new Set(ids.map((id) => id.toString())))
    }

    const handlePresenceUpdate = ({ userId, isOnline }) => {
      if (!userId) {
        return
      }

      const id = userId.toString()

      setOnlineUserIds((prev) => {
        const next = new Set(prev)

        if (isOnline) {
          next.add(id)
        } else {
          next.delete(id)
        }

        return next
      })
    }

    const handleConversationUpdated = (conversation) => {
      if (!conversation?._id) {
        return
      }

      const isActive = conversation._id === activeConversationIdRef.current

      setUnreadCounts((prev) => ({
        ...prev,
        [conversation._id]: isActive ? 0 : conversation.unreadCount || 0,
      }))
    }

    instance.on(SOCKET_EVENTS.CONNECT, handleConnect)
    instance.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect)
    instance.on(SOCKET_EVENTS.PRESENCE_SNAPSHOT, handleSnapshot)
    instance.on(SOCKET_EVENTS.PRESENCE_UPDATE, handlePresenceUpdate)
    instance.on(SOCKET_EVENTS.CONVERSATION_UPDATED, handleConversationUpdated)

    if (instance.connected) {
      setConnected(true)
    }

    return () => {
      instance.off(SOCKET_EVENTS.CONNECT, handleConnect)
      instance.off(SOCKET_EVENTS.DISCONNECT, handleDisconnect)
      instance.off(SOCKET_EVENTS.PRESENCE_SNAPSHOT, handleSnapshot)
      instance.off(SOCKET_EVENTS.PRESENCE_UPDATE, handlePresenceUpdate)
      instance.off(SOCKET_EVENTS.CONVERSATION_UPDATED, handleConversationUpdated)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setUnreadCounts({})
      return
    }

    getConversations()
      .then((data) => {
        const counts = {}
        data.forEach((conversation) => {
          counts[conversation._id] = conversation.unreadCount || 0
        })
        setUnreadCounts(counts)
      })
      .catch(() => {})
  }, [user])

  const isUserOnline = useCallback(
    (userId) => {
      if (!userId) {
        return false
      }

      return onlineUserIds.has(userId.toString())
    },
    [onlineUserIds],
  )

  const clearUnread = useCallback((conversationId) => {
    setUnreadCounts((prev) => ({ ...prev, [conversationId]: 0 }))
  }, [])

  const totalUnread = useMemo(
    () => Object.values(unreadCounts).reduce((sum, count) => sum + count, 0),
    [unreadCounts],
  )

  const value = useMemo(
    () => ({
      socket: socket || getSocket(),
      connected,
      onlineUserIds,
      isUserOnline,
      setReconnectHandler,
      totalUnread,
      clearUnread,
      setActiveConversation,
    }),
    [
      socket,
      connected,
      onlineUserIds,
      isUserOnline,
      setReconnectHandler,
      totalUnread,
      clearUnread,
      setActiveConversation,
    ],
  )

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  )
}

export default SocketContext