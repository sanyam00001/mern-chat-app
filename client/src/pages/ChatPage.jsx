import { useCallback, useEffect, useRef, useState } from 'react'
import ConversationSidebar from '../components/chat/ConversationSidebar'
import MessageInput from '../components/chat/MessageInput'
import MessageList from '../components/chat/MessageList'
import NewConversationPanel from '../components/chat/NewConversationPanel'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'
import {
  createOrFindConversation,
  getConversations,
  getMessages,
  sendMessage as sendMessageApi,
} from '../services/chatService'
import { getInitials } from '../utils/chatUtils'
import { SOCKET_EVENTS } from '../utils/constants'

const TYPING_THROTTLE_MS = 1500

const getMessageConversationId = (message) =>
  (message.conversation?._id || message.conversation || '').toString()

function ChatPage() {
  const { user } = useAuth()
  const { socket, connected, isUserOnline, setReconnectHandler } = useSocket()

  const [conversations, setConversations] = useState([])
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [conversationsError, setConversationsError] = useState('')

  const [selectedConversationId, setSelectedConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState('')
  const [typingUser, setTypingUser] = useState(null)

  const [showNewConversation, setShowNewConversation] = useState(false)
  const [mobileView, setMobileView] = useState('sidebar')

  const selectedConversationIdRef = useRef(null)
  const lastTypingEmitRef = useRef(0)

  const selectedConversation = conversations.find(
    (conversation) => conversation._id === selectedConversationId,
  )

  const otherParticipant = selectedConversation?.otherParticipant
  const isOtherOnline = isUserOnline(otherParticipant?._id)

  const upsertConversation = useCallback((conversation) => {
    setConversations((prev) => {
      const exists = prev.some((item) => item._id === conversation._id)
      const next = exists
        ? prev.map((item) =>
            item._id === conversation._id ? { ...item, ...conversation } : item,
          )
        : [conversation, ...prev]

      return next.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      )
    })
  }, [])

  const loadConversations = useCallback(async () => {
    setConversationsLoading(true)
    setConversationsError('')

    try {
      const data = await getConversations()
      setConversations(data)
    } catch (error) {
      setConversationsError(error.message || 'Failed to load conversations')
    } finally {
      setConversationsLoading(false)
    }
  }, [])

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) {
      return
    }

    setMessagesLoading(true)
    setMessagesError('')

    try {
      const data = await getMessages(conversationId)
      setMessages(data.messages)
    } catch (error) {
      setMessagesError(error.message || 'Failed to load messages')
      setMessages([])
    } finally {
      setMessagesLoading(false)
    }
  }, [])

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId
  }, [selectedConversationId])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId)
      socket?.emit(SOCKET_EVENTS.CONVERSATION_JOIN, {
        conversationId: selectedConversationId,
      })
    } else {
      setMessages([])
      setTypingUser(null)
    }
  }, [selectedConversationId, loadMessages, socket])

  useEffect(() => {
    setReconnectHandler(() => {
      loadConversations()

      const conversationId = selectedConversationIdRef.current

      if (conversationId) {
        loadMessages(conversationId)
        socket?.emit(SOCKET_EVENTS.CONVERSATION_JOIN, { conversationId })
      }
    })

    return () => setReconnectHandler(null)
  }, [loadConversations, loadMessages, setReconnectHandler, socket])

  useEffect(() => {
    if (!socket) {
      return undefined
    }

    const handleNewMessage = (message) => {
      const conversationId = getMessageConversationId(message)

      if (conversationId !== selectedConversationIdRef.current) {
        return
      }

      setMessages((prev) => {
        if (prev.some((item) => item._id === message._id)) {
          return prev
        }

        return [...prev, message]
      })

      setTypingUser((current) =>
        current && conversationId === selectedConversationIdRef.current
          ? null
          : current,
      )
    }

    const handleConversationUpdated = (conversation) => {
      if (!conversation?._id) {
        return
      }

      upsertConversation(conversation)
    }

    const handleTypingStart = ({ conversationId, userId, name }) => {
      if (
        conversationId === selectedConversationIdRef.current &&
        userId !== user?._id
      ) {
        setTypingUser(name || 'User')
      }
    }

    const handleTypingStop = ({ conversationId, userId }) => {
      if (
        conversationId === selectedConversationIdRef.current &&
        userId !== user?._id
      ) {
        setTypingUser(null)
      }
    }

    socket.on(SOCKET_EVENTS.MESSAGE_NEW, handleNewMessage)
    socket.on(SOCKET_EVENTS.CONVERSATION_UPDATED, handleConversationUpdated)
    socket.on(SOCKET_EVENTS.TYPING_START, handleTypingStart)
    socket.on(SOCKET_EVENTS.TYPING_STOP, handleTypingStop)

    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_NEW, handleNewMessage)
      socket.off(SOCKET_EVENTS.CONVERSATION_UPDATED, handleConversationUpdated)
      socket.off(SOCKET_EVENTS.TYPING_START, handleTypingStart)
      socket.off(SOCKET_EVENTS.TYPING_STOP, handleTypingStop)
    }
  }, [socket, upsertConversation, user?._id])

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId)
    setShowNewConversation(false)
    setMobileView('chat')
    setTypingUser(null)
  }

  const handleStartConversation = async (recipientId) => {
    const conversation = await createOrFindConversation(recipientId)

    upsertConversation(conversation)
    setSelectedConversationId(conversation._id)
    setShowNewConversation(false)
    setMobileView('chat')
  }

  const emitTypingStop = useCallback(() => {
    if (!socket || !selectedConversationId) {
      return
    }

    lastTypingEmitRef.current = 0
    socket.emit(SOCKET_EVENTS.TYPING_STOP, {
      conversationId: selectedConversationId,
    })
  }, [socket, selectedConversationId])

  const handleTyping = useCallback(() => {
    if (!socket || !selectedConversationId) {
      return
    }

    const now = Date.now()

    if (now - lastTypingEmitRef.current < TYPING_THROTTLE_MS) {
      return
    }

    lastTypingEmitRef.current = now
    socket.emit(SOCKET_EVENTS.TYPING_START, {
      conversationId: selectedConversationId,
    })
  }, [socket, selectedConversationId])

  const handleSendMessage = async (content) => {
    if (!selectedConversationId) {
      return
    }

    emitTypingStop()

    const newMessage = await sendMessageApi(selectedConversationId, content)

    setMessages((prev) => {
      if (prev.some((item) => item._id === newMessage._id)) {
        return prev
      }

      return [...prev, newMessage]
    })

    upsertConversation({
      ...(selectedConversation || { _id: selectedConversationId }),
      lastMessage: {
        content: newMessage.content,
        sender: newMessage.sender._id,
        createdAt: newMessage.createdAt,
      },
      updatedAt: newMessage.createdAt,
    })
  }

  const handleBackToSidebar = () => {
    setMobileView('sidebar')
  }

  return (
    <div className="container-app py-4 md:py-6">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-5">
          <div>
            <h1 className="text-lg font-semibold text-white">Chat</h1>
            <p className="text-sm text-slate-400">
              Send messages to other users
              {connected ? '' : ' · Reconnecting...'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowNewConversation((prev) => !prev)
              if (mobileView === 'chat') {
                setMobileView('sidebar')
              }
            }}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition hover:bg-primary-500"
          >
            {showNewConversation ? 'Close' : 'New chat'}
          </button>
        </div>

        {showNewConversation && (
          <NewConversationPanel
            onStartConversation={handleStartConversation}
            onCancel={() => setShowNewConversation(false)}
          />
        )}

        <div className="flex h-[calc(100svh-12rem)] min-h-[480px]">
          <ConversationSidebar
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            loading={conversationsLoading}
            error={conversationsError}
            onRetry={loadConversations}
            showOnMobile={mobileView === 'sidebar'}
            isUserOnline={isUserOnline}
          />

          <section
            className={[
              'flex min-w-0 flex-1 flex-col',
              mobileView === 'chat' ? 'flex' : 'hidden md:flex',
            ].join(' ')}
            aria-label="Chat messages"
          >
            {selectedConversation ? (
              <>
                <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                  <button
                    type="button"
                    onClick={handleBackToSidebar}
                    className="rounded-lg px-2 py-1 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white md:hidden"
                    aria-label="Back to conversations"
                  >
                    ← Back
                  </button>

                  <div className="relative shrink-0" aria-hidden="true">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/20 text-sm font-semibold text-primary-200">
                      {getInitials(otherParticipant?.name || '?')}
                    </div>
                    <span
                      className={[
                        'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface-950',
                        isOtherOnline ? 'bg-emerald-400' : 'bg-slate-500',
                      ].join(' ')}
                    />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate font-medium text-white">
                      {otherParticipant?.name || 'Unknown user'}
                    </h2>
                    <p className="truncate text-xs text-slate-400">
                      {isOtherOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </header>

                <MessageList
                  messages={messages}
                  currentUserId={user?._id}
                  loading={messagesLoading}
                  error={messagesError}
                  onRetry={() => loadMessages(selectedConversationId)}
                  typingUser={typingUser}
                />

                <MessageInput
                  onSend={handleSendMessage}
                  onTyping={handleTyping}
                  onTypingStop={emitTypingStop}
                />
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                <p className="text-sm text-slate-400">
                  Select a conversation to view messages
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Or start a new chat with another user.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
