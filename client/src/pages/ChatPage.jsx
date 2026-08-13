import { useCallback, useEffect, useState } from 'react'
import ConversationSidebar from '../components/chat/ConversationSidebar'
import MessageInput from '../components/chat/MessageInput'
import MessageList from '../components/chat/MessageList'
import NewConversationPanel from '../components/chat/NewConversationPanel'
import { useAuth } from '../hooks/useAuth'
import {
  createOrFindConversation,
  getConversations,
  getMessages,
  sendMessage as sendMessageApi,
} from '../services/chatService'
import { getInitials } from '../utils/chatUtils'

function ChatPage() {
  const { user } = useAuth()

  const [conversations, setConversations] = useState([])
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [conversationsError, setConversationsError] = useState('')

  const [selectedConversationId, setSelectedConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState('')

  const [showNewConversation, setShowNewConversation] = useState(false)
  const [mobileView, setMobileView] = useState('sidebar')

  const selectedConversation = conversations.find(
    (conversation) => conversation._id === selectedConversationId,
  )

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
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId)
    } else {
      setMessages([])
    }
  }, [selectedConversationId, loadMessages])

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId)
    setShowNewConversation(false)
    setMobileView('chat')
  }

  const handleStartConversation = async (recipientId) => {
    const conversation = await createOrFindConversation(recipientId)

    setConversations((prev) => {
      const exists = prev.some((item) => item._id === conversation._id)

      if (exists) {
        return prev.map((item) =>
          item._id === conversation._id ? conversation : item,
        )
      }

      return [conversation, ...prev]
    })

    setSelectedConversationId(conversation._id)
    setShowNewConversation(false)
    setMobileView('chat')
  }

  const handleSendMessage = async (content) => {
    if (!selectedConversationId) {
      return
    }

    const newMessage = await sendMessageApi(selectedConversationId, content)

    setMessages((prev) => [...prev, newMessage])

    setConversations((prev) =>
      prev
        .map((conversation) =>
          conversation._id === selectedConversationId
            ? {
                ...conversation,
                lastMessage: {
                  content: newMessage.content,
                  sender: newMessage.sender._id,
                  createdAt: newMessage.createdAt,
                },
                updatedAt: newMessage.createdAt,
              }
            : conversation,
        )
        .sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
        ),
    )
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

                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-sm font-semibold text-primary-200"
                    aria-hidden="true"
                  >
                    {getInitials(
                      selectedConversation.otherParticipant?.name || '?',
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate font-medium text-white">
                      {selectedConversation.otherParticipant?.name ||
                        'Unknown user'}
                    </h2>
                    <p className="truncate text-xs text-slate-400">
                      {selectedConversation.otherParticipant?.email}
                    </p>
                  </div>
                </header>

                <MessageList
                  messages={messages}
                  currentUserId={user?._id}
                  loading={messagesLoading}
                  error={messagesError}
                  onRetry={() => loadMessages(selectedConversationId)}
                />

                <MessageInput onSend={handleSendMessage} />
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
