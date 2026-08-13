import { getInitials, formatConversationTime } from "../../utils/chatUtils";

function ConversationSidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  loading,
  error,
  onRetry,
  showOnMobile,
}) {
  return (
    <aside
      className={[
        'flex w-full flex-col border-white/10 bg-surface-900/50 md:w-80 md:shrink-0 md:border-r',
        showOnMobile ? 'flex' : 'hidden md:flex',
      ].join(' ')}
      aria-label="Conversations"
    >
      <div className="border-b border-white/10 px-4 py-4">
        <h2 className="text-lg font-semibold text-white">Messages</h2>
        <p className="mt-1 text-sm text-slate-400">Your conversations</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-12" role="status">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500/30 border-t-primary-400" />
          </div>
        )}

        {!loading && error && (
          <div className="p-4 text-center">
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-lg px-3 py-1.5 text-sm font-medium text-primary-300 transition hover:bg-white/5"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && conversations.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-sm text-slate-400">No conversations yet.</p>
            <p className="mt-1 text-xs text-slate-500">
              Start a new chat to begin messaging.
            </p>
          </div>
        )}

        {!loading && !error && conversations.length > 0 && (
          <ul className="divide-y divide-white/5">
            {conversations.map((conversation) => {
              const isSelected = conversation._id === selectedConversationId
              const participant = conversation.otherParticipant

              return (
                <li key={conversation._id}>
                  <button
                    type="button"
                    onClick={() => onSelectConversation(conversation._id)}
                    className={[
                      'flex w-full items-start gap-3 px-4 py-3 text-left transition',
                      isSelected
                        ? 'bg-primary-500/10'
                        : 'hover:bg-white/[0.03]',
                    ].join(' ')}
                    aria-current={isSelected ? 'true' : undefined}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-sm font-semibold text-primary-200"
                      aria-hidden="true"
                    >
                      {participant?.avatar ? (
                        <img
                          src={participant.avatar}
                          alt=""
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(participant?.name || '?')
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate font-medium text-white">
                          {participant?.name || 'Unknown user'}
                        </p>
                        {conversation.lastMessage && (
                          <span className="shrink-0 text-xs text-slate-500">
                            {formatConversationTime(conversation.updatedAt)}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-sm text-slate-400">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}

export default ConversationSidebar
