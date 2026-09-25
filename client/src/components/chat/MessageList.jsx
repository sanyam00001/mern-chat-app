import { useEffect, useRef, useState } from 'react'
import {
  downloadAttachment,
  fetchAttachmentBlob,
} from '../../services/chatService'
import { formatFileSize, formatMessageTime } from '../../utils/chatUtils'

function AuthenticatedImage({ url, alt }) {
  const [src, setSrc] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let objectUrl = ''
    let cancelled = false

    const load = async () => {
      try {
        const blob = await fetchAttachmentBlob(url)

        if (cancelled) {
          return
        }

        objectUrl = URL.createObjectURL(blob)
        setSrc(objectUrl)
      } catch {
        if (!cancelled) {
          setError('Unable to load image')
        }
      }
    }

    load()

    return () => {
      cancelled = true

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [url])

  if (error) {
    return (
      <p className="text-sm text-red-200" role="alert">
        {error}
      </p>
    )
  }

  if (!src) {
    return <p className="text-sm text-white/70">Loading image...</p>
  }

  return (
    <img
      src={src}
      alt={alt}
      className="max-h-72 w-full rounded-xl object-cover"
    />
  )
}

function FileAttachment({ attachment, isOwn }) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState('')

  const handleDownload = async () => {
    setError('')
    setIsDownloading(true)

    try {
      await downloadAttachment(attachment.url, attachment.originalName)
    } catch (downloadError) {
      setError(downloadError.message || 'Unable to download file')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="mt-1">
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 px-3 py-2">
        <div
          className={[
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase',
            isOwn ? 'bg-white/15 text-white' : 'bg-primary-500/20 text-primary-200',
          ].join(' ')}
        >
          FILE
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {attachment.originalName}
          </p>
          <p className={isOwn ? 'text-xs text-primary-100/70' : 'text-xs text-slate-400'}>
            {formatFileSize(attachment.size)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className={[
            'shrink-0 rounded-lg px-2 py-1 text-xs font-semibold transition disabled:opacity-60',
            isOwn
              ? 'bg-white/15 text-white hover:bg-white/25'
              : 'bg-white/10 text-primary-200 hover:bg-white/15',
          ].join(' ')}
        >
          {isDownloading ? 'Opening...' : 'Download'}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-200" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

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
          const messageType = message.messageType || 'text'

          return (
            <li
              key={message._id}
              className={['flex', isOwn ? 'justify-end' : 'justify-start'].join(
                ' ',
              )}
            >
              <div
                className={[
                  'max-w-[75%] rounded-2xl shadow-sm',
                  messageType === 'image' ? 'p-1' : 'px-4 py-2.5',
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

                {messageType === 'image' && message.attachment?.url && (
                  <AuthenticatedImage
                    url={message.attachment.url}
                    alt={message.attachment.originalName || 'Image'}
                  />
                )}

                {messageType === 'file' && message.attachment && (
                  <FileAttachment attachment={message.attachment} isOwn={isOwn} />
                )}

                {message.content ? (
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm">
                    {message.content}
                  </p>
                ) : null}

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
