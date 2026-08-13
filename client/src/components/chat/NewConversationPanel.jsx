import { useEffect, useState } from 'react'
import { searchUsers } from '../../services/chatService'
import { getInitials } from '../../utils/chatUtils'

function NewConversationPanel({ onStartConversation, onCancel }) {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [startingUserId, setStartingUserId] = useState(null)

  useEffect(() => {
    if (search.trim().length < 2) {
      setUsers([])
      setError('')
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true)
      setError('')

      try {
        const results = await searchUsers(search.trim())
        setUsers(results)
      } catch (searchError) {
        setError(searchError.message || 'Failed to search users')
        setUsers([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search])

  const handleStart = async (userId) => {
    setStartingUserId(userId)
    setError('')

    try {
      await onStartConversation(userId)
    } catch (startError) {
      setError(startError.message || 'Failed to start conversation')
    } finally {
      setStartingUserId(null)
    }
  }

  return (
    <div className="border-b border-white/10 bg-surface-900/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">New conversation</h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          Cancel
        </button>
      </div>

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by name or email..."
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        aria-label="Search users"
      />

      {error && (
        <p className="mt-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="mt-3 max-h-48 overflow-y-auto">
        {loading && (
          <p className="py-4 text-center text-sm text-slate-400" role="status">
            Searching...
          </p>
        )}

        {!loading && search.trim().length >= 2 && users.length === 0 && !error && (
          <p className="py-4 text-center text-sm text-slate-400">
            No users found.
          </p>
        )}

        {!loading && search.trim().length < 2 && (
          <p className="py-4 text-center text-xs text-slate-500">
            Type at least 2 characters to search.
          </p>
        )}

        {!loading && users.length > 0 && (
          <ul className="divide-y divide-white/5 rounded-xl border border-white/10">
            {users.map((user) => (
              <li key={user._id}>
                <button
                  type="button"
                  onClick={() => handleStart(user._id)}
                  disabled={startingUserId === user._id}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-xs font-semibold text-primary-200"
                    aria-hidden="true"
                  >
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-slate-400">{user.email}</p>
                  </div>
                  <span className="text-xs font-medium text-primary-300">
                    {startingUserId === user._id ? 'Starting...' : 'Chat'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default NewConversationPanel
