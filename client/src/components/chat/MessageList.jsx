import { useEffect, useRef } from 'react'
import { formatMessageTime } from '../../utils/chatUtils'

function MessageList({
  messages,
  currentUserId,
  loading,
  error,
  onRetry,
  typingUser,
}) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUser])

  if (loading) {
    return (
      <div
        className="flex flex-1 items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500/30 border-t-primary-400" />
          <p className="text-sm text-slate-400">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary-300 transition hover:bg-white/5"
        >
          Try again
        </button>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-slate-400">No messages yet.</p>
        <p className="mt-1 text-xs text-slate-500">
          Send a message to start the conversation.
        </p>
        {typingUser && (
          <p className="mt-4 text-sm text-primary-300" aria-live="polite">
            {typingUser} is typing...
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <ul className="flex flex-col gap-3" aria-label="Messages">
        {messages.map((message) => {
          const isOwn = message.sender._id === currentUserId

          return (
            <li
              key={message._id}
              className={['flex', isOwn ? 'justify-end' : 'justify-start'].join(
                ' ',
              )}
            >
              <div
                className={[
                  'max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm',
                  isOwn
                    ? 'rounded-br-md bg-primary-600 text-white'
                    : 'rounded-bl-md border border-white/10 bg-white/[0.05] text-slate-100',
                ].join(' ')}
              >
                {!isOwn && (
                  <p className="mb-1 text-xs font-medium text-primary-300">
                    {message.sender.name}
                  </p>
                )}
                <p className="whitespace-pre-wrap break-words text-sm">
                  {message.content}
                </p>
                <p
                  className={[
                    'mt-1 text-right text-[11px]',
                    isOwn ? 'text-primary-100/70' : 'text-slate-500',
                  ].join(' ')}
                >
                  {formatMessageTime(message.createdAt)}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
      {typingUser && (
        <p className="mt-3 text-sm text-primary-300" aria-live="polite">
          {typingUser} is typing...
        </p>
      )}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  )
}

export default MessageList
