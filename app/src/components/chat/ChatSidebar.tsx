import {cn} from '@/lib/utils'
import type {Conversation} from '@/types/chat'
import {Edit2, MessageSquare, MoreVertical, Pin, Plus, Trash2} from 'lucide-react'
import {useState} from 'react'

interface ChatSidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onRenameConversation: (id: string, title: string) => void
  onDeleteConversation: (id: string) => void
  onPinConversation: (id: string) => void
}

export function ChatSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
  onPinConversation,
}: ChatSidebarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const handleRename = (conv: Conversation) => {
    setEditingId(conv.id)
    setEditTitle(conv.title)
    setActiveMenu(null)
  }

  const saveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim())
    }
    setEditingId(null)
    setEditTitle('')
  }

  const pinnedConversations = (conversations || []).filter((c) => c.isPinned)
  const regularConversations = (conversations || []).filter((c) => !c.isPinned)

  return (
    <div className="flex h-full w-64 flex-col border-r bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <button
          onClick={onNewConversation}
          className="flex w-full items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Pinned Section */}
        {pinnedConversations.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 px-2 text-xs font-semibold text-gray-500">PINNED</p>
            {pinnedConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === currentConversationId}
                isEditing={editingId === conv.id}
                editTitle={editTitle}
                activeMenu={activeMenu}
                onSelect={() => onSelectConversation(conv.id)}
                onEditTitleChange={setEditTitle}
                onSaveRename={() => saveRename(conv.id)}
                onCancelEdit={() => setEditingId(null)}
                onToggleMenu={() => setActiveMenu(activeMenu === conv.id ? null : conv.id)}
                onRename={() => handleRename(conv)}
                onPin={() => onPinConversation(conv.id)}
                onDelete={() => onDeleteConversation(conv.id)}
              />
            ))}
          </div>
        )}

        {/* Regular Conversations */}
        {regularConversations.length > 0 && (
          <div>
            <p className="mb-2 px-2 text-xs font-semibold text-gray-500">RECENT</p>
            {regularConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === currentConversationId}
                isEditing={editingId === conv.id}
                editTitle={editTitle}
                activeMenu={activeMenu}
                onSelect={() => onSelectConversation(conv.id)}
                onEditTitleChange={setEditTitle}
                onSaveRename={() => saveRename(conv.id)}
                onCancelEdit={() => setEditingId(null)}
                onToggleMenu={() => setActiveMenu(activeMenu === conv.id ? null : conv.id)}
                onRename={() => handleRename(conv)}
                onPin={() => onPinConversation(conv.id)}
                onDelete={() => onDeleteConversation(conv.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  isEditing: boolean
  editTitle: string
  activeMenu: string | null
  onSelect: () => void
  onEditTitleChange: (title: string) => void
  onSaveRename: () => void
  onCancelEdit: () => void
  onToggleMenu: () => void
  onRename: () => void
  onPin: () => void
  onDelete: () => void
}

function ConversationItem({
  conversation,
  isActive,
  isEditing,
  editTitle,
  activeMenu,
  onSelect,
  onEditTitleChange,
  onSaveRename,
  onCancelEdit,
  onToggleMenu,
  onRename,
  onPin,
  onDelete,
}: ConversationItemProps) {
  return (
    <div
      className={cn(
        'group relative mb-1 flex items-center gap-2 rounded-lg px-3 py-2 transition cursor-pointer',
        isActive ? 'bg-primary/10 text-primary' : 'hover:bg-gray-200'
      )}
      onClick={onSelect}
    >
      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => onEditTitleChange(e.target.value)}
          onBlur={onSaveRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveRename()
            if (e.key === 'Escape') onCancelEdit()
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 rounded border border-primary bg-white px-2 py-1 text-sm focus:outline-none"
          autoFocus
        />
      ) : (
        <>
          <MessageSquare size={16} className="shrink-0" />
          <span className="flex-1 truncate text-sm">
            {conversation.title}
          </span>
          {conversation.isPinned && <Pin size={14} className="shrink-0 text-gray-400" />}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleMenu()
              }}
              className="rounded p-1 opacity-0 transition hover:bg-gray-300 group-hover:opacity-100"
            >
              <MoreVertical size={16} />
            </button>

            {activeMenu === conversation.id && (
              <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border bg-white py-1 shadow-lg">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRename()
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
                >
                  <Edit2 size={14} />
                  Rename
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onPin()
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
                >
                  <Pin size={14} />
                  {conversation.isPinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
