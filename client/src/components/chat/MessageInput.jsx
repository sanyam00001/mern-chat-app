import { useEffect, useRef, useState } from 'react'

const TYPING_STOP_DELAY_MS = 2000

function MessageInput({ onSend, onTyping, onTypingStop, disabled }) {
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const stopTimeoutRef = useRef(null)
  const onTypingStopRef = useRef(onTypingStop)

  onTypingStopRef.current = onTypingStop

  const clearTypingTimeout = () => {
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current)
      stopTimeoutRef.current = null
    }
  }

  const scheduleTypingStop = () => {
    clearTypingTimeout()
    stopTimeoutRef.current = setTimeout(() => {
      onTypingStopRef.current?.()
    }, TYPING_STOP_DELAY_MS)
  }

  useEffect(() => {
    return () => {
      clearTypingTimeout()
      onTypingStopRef.current?.()
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmed = content.trim()

    if (!trimmed) {
      setError('Message cannot be empty')
      return
    }

    setError('')
    setIsSending(true)

    try {
      onTypingStop?.()
      await onSend(trimmed)
      setContent('')
    } catch (sendError) {
      setError(sendError.message || 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleChange = (event) => {
    const value = event.target.value
    setContent(value)

    if (error) {
      setError('')
    }

    if (value.trim()) {
      onTyping?.()
      scheduleTypingStop()
    } else {
      clearTypingTimeout()
      onTypingStop?.()
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-white/10 bg-surface-900/30 p-4"
    >
      {error && (
        <p className="mb-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-end gap-3">
        <textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={disabled || isSending}
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={disabled || isSending || !content.trim()}
          className="inline-flex h-[44px] shrink-0 items-center justify-center rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  )
}

export default MessageInput
