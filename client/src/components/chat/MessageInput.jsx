import { useEffect, useRef, useState } from 'react'
import { formatFileSize } from '../../utils/chatUtils'
import { UPLOAD_ACCEPT } from '../../utils/constants'
import { validateUploadFile } from '../../utils/validation'

const TYPING_STOP_DELAY_MS = 2000

function MessageInput({ onSend, onTyping, onTypingStop, disabled }) {
  const [content, setContent] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const fileInputRef = useRef(null)
  const stopTimeoutRef = useRef(null)
  const onTypingStopRef = useRef(onTypingStop)

  onTypingStopRef.current = onTypingStop

  const canSend = Boolean(content.trim() || selectedFile)

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

  const clearSelectedFile = () => {
    setSelectedFile(null)
    setUploadProgress(0)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    return () => {
      clearTypingTimeout()
      onTypingStopRef.current?.()
    }
  }, [])

  useEffect(() => {
    if (!selectedFile || !selectedFile.type.startsWith('image/')) {
      setPreviewUrl('')
      return undefined
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmed = content.trim()

    if (!trimmed && !selectedFile) {
      setError('Message cannot be empty')
      return
    }

    if (selectedFile) {
      const fileError = validateUploadFile(selectedFile)

      if (fileError) {
        setError(fileError)
        return
      }
    }

    setError('')
    setIsSending(true)
    setUploadProgress(selectedFile ? 0 : 100)

    try {
      onTypingStop?.()
      await onSend({
        content: trimmed,
        file: selectedFile,
        onProgress: setUploadProgress,
      })
      setContent('')
      clearSelectedFile()
    } catch (sendError) {
      setError(sendError.message || 'Failed to send message')
    } finally {
      setIsSending(false)
      setUploadProgress(0)
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

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const fileError = validateUploadFile(file)

    if (fileError) {
      setError(fileError)
      event.target.value = ''
      return
    }

    setError('')
    setSelectedFile(file)
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

      {selectedFile && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500/15 text-xs font-semibold text-primary-200">
              FILE
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-white">{selectedFile.name}</p>
            <p className="text-xs text-slate-400">
              {formatFileSize(selectedFile.size)}
            </p>
            {isSending && (
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-primary-500 transition-[width]"
                  style={{ width: `${Math.max(uploadProgress, 8)}%` }}
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={clearSelectedFile}
            disabled={isSending}
            className="rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-60"
          >
            Remove
          </button>
        </div>
      )}

      <div className="flex items-end gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={UPLOAD_ACCEPT}
          onChange={handleFileChange}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isSending}
          className="inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Attach file"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.82-2.83l8.49-8.48"
            />
          </svg>
        </button>

        <textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={selectedFile ? 'Add a caption (optional)...' : 'Type a message...'}
          rows={1}
          disabled={disabled || isSending}
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={disabled || isSending || !canSend}
          className="inline-flex h-[44px] shrink-0 items-center justify-center rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? (selectedFile ? 'Uploading...' : 'Sending...') : 'Send'}
        </button>
      </div>
    </form>
  )
}

export default MessageInput
