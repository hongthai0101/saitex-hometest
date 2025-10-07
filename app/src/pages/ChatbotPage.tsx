import {ChatInput} from '@/components/chat/ChatInput'
import {ChatMessage} from '@/components/chat/ChatMessage'
import {ChatSidebar} from '@/components/chat/ChatSidebar'
import {chatService} from '@/services/chat.service'
import {useAuthStore} from '@/store/auth.store'
import {useChatStore} from '@/store/chat.store'
import type {Message, MessageRole, MessageType} from '@/types/chat'
import {Menu} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'

export default function ChatbotPage() {
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const {user} = useAuthStore()
  const {
    conversations,
    currentConversation,
    messages,
    isStreaming,
    streamingContent,
    setConversations,
    setCurrentConversation,
    setMessages,
    addMessage,
    updateConversation,
    removeConversation,
    setIsStreaming,
    appendStreamingContent,
    clearStreamingContent,
  } = useChatStore()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isThinking, setIsThinking] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    loadConversations()
  }, [user, navigate])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent])

  // Cleanup streaming content when streaming stops
  useEffect(() => {
    if (!isStreaming && streamingContent) {
      // Clear after a brief delay to ensure message is rendered
      const timer = setTimeout(() => {
        clearStreamingContent()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isStreaming, streamingContent, clearStreamingContent])


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
  }

  const loadConversations = async () => {
    if (!user) return
    try {
      const convs = await chatService.getConversations(user.id)
      setConversations(convs)

      // Try to restore previous conversation from localStorage
      const savedConversationId = localStorage.getItem('currentConversationId')

      if (savedConversationId && convs.some(c => c.id === savedConversationId)) {
        // Restore previous conversation
        const savedConv = convs.find(c => c.id === savedConversationId)
        if (savedConv) {
          setCurrentConversation(savedConv)
          const msgs = await chatService.getMessages(savedConv.id)
          setMessages(msgs)
        }
      } else if (!currentConversation && convs.length > 0) {
        // Auto-select most recent conversation if none selected
        const mostRecent = convs[0] // Already sorted by updatedAt DESC
        setCurrentConversation(mostRecent || null)

        // Load messages for most recent conversation
        const msgs = await chatService.getMessages(mostRecent?.id || '')
        setMessages(msgs)
      }
    } catch (error) {
      // Handle error silently or show user-friendly message
    }
  }

  const handleSelectConversation = async (id: string) => {
    try {
      const conv = await chatService.getConversation(id, user!.id)
      setCurrentConversation(conv)
      localStorage.setItem('currentConversationId', conv.id)

      const msgs = await chatService.getMessages(id)
      setMessages(msgs)
    } catch (error) {
      // Handle error silently or show user-friendly message
    }
  }

  const handleNewConversation = () => {
    // Just clear current conversation and messages
    // Backend will create conversation when first message is sent
    setCurrentConversation(null)
    setMessages([])

    // Clear saved conversation ID
    localStorage.removeItem('currentConversationId')
  }

  const handleRenameConversation = async (id: string, title: string) => {
    if (!user) return
    try {
      await chatService.updateConversation(id, user.id, {title})
      updateConversation(id, {title})
    } catch (error) {
      // Handle error silently or show user-friendly message
    }
  }

  const handleDeleteConversation = async (id: string) => {
    if (!user) return
    try {
      await chatService.deleteConversation(id, user.id)
      removeConversation(id)
      if (currentConversation?.id === id) {
        setCurrentConversation(null)
        setMessages([])
        localStorage.removeItem('currentConversationId')
      }
    } catch (error) {
      // Handle error silently or show user-friendly message
    }
  }

  const handlePinConversation = async (id: string) => {
    if (!user) return
    try {
      const updatedConv = await chatService.togglePinConversation(id, user.id)
      updateConversation(id, {isPinned: updatedConv.isPinned})
    } catch (error) {
      // Handle error silently or show user-friendly message
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!user || isStreaming) return

    const conversationId = currentConversation?.id

    // Optimistically add user message to UI
    const tempUserMessage: Message = {
      id: 'temp-user-' + Date.now(),
      conversationId: conversationId || 'temp',
      role: 'user' as MessageRole,
      type: 'text' as MessageType,
      content: message,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      cost: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addMessage(tempUserMessage)

    // Start streaming
    setIsStreaming(true)
    setIsThinking(true)
    clearStreamingContent()

    try {
      const stream = chatService.streamChat({
        message,
        conversationId, // undefined if new conversation
        userId: user.id,
        stream: true,
      })

      let streamedContent = ''
      let firstChunk = true
      let actualConversationId = conversationId

      for await (const chunk of stream) {
        if (firstChunk) {
          setIsThinking(false)
          firstChunk = false
        }

        streamedContent += chunk.content
        appendStreamingContent(chunk.content)

        if (chunk.finished) {
          if (chunk.metadata?.conversationId && typeof chunk.metadata.conversationId === 'string') {
            actualConversationId = chunk.metadata.conversationId
          }

          // Create the final message
          const tempAssistantMessage: Message = {
            id: 'temp-assistant-' + Date.now(),
            conversationId: actualConversationId || conversationId || 'temp',
            role: 'assistant' as MessageRole,
            type: 'text' as MessageType,
            content: streamedContent,
            promptTokens: chunk.usage?.promptTokens || 0,
            completionTokens: chunk.usage?.completionTokens || 0,
            totalTokens: chunk.usage?.totalTokens || 0,
            cost: 0,
            sqlQuery: chunk.sqlQuery,
            sqlResult: chunk.sqlResult,
            metadata: chunk.metadata,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          // Add message to the messages array FIRST
          addMessage(tempAssistantMessage)

          // Stop streaming - the message is now in the messages array
          // The useEffect will handle clearing streamingContent
          setIsStreaming(false)
          setIsThinking(false)

          break
        }
      }

      const finalConversationId = actualConversationId || conversationId

      if (finalConversationId) {
        const conv = await chatService.getConversation(finalConversationId, user.id)
        setCurrentConversation(conv)
        localStorage.setItem('currentConversationId', conv.id)

        const convs = await chatService.getConversations(user.id)
        setConversations(convs)

        // REMOVED: Background sync that was causing messages to disappear
        // Messages will sync when user switches conversations or refreshes page
        // This keeps the streamed content visible immediately after sending
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        clearStreamingContent()
        setIsStreaming(false)
        setIsThinking(false)
        return
      }
      alert('Failed to send message: ' + (error?.message || 'Unknown error'))
      clearStreamingContent()
      setIsStreaming(false)
      setIsThinking(false)
    }
  }

  return (
    <div className="flex h-full overflow-hidden max-w-full">
      {/* Chat History Sidebar */}
      {sidebarOpen && (
        <div className="relative">
          <ChatSidebar
            conversations={conversations}
            currentConversationId={currentConversation?.id || null}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onRenameConversation={handleRenameConversation}
            onDeleteConversation={handleDeleteConversation}
            onPinConversation={handlePinConversation}
          />
          {/* Mobile overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col min-w-0 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold">
              {currentConversation?.title || 'AI Assistant'}
            </h1>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto min-w-0 max-w-full">
          {messages.length === 0 && !isStreaming ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Start a new conversation
                </h2>
                <p className="mt-2 text-gray-600">Ask me anything about your data!</p>
              </div>
            </div>
          ) : (
            <div>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} role={msg.role} content={msg.content} />
              ))}
              {isStreaming && (
                <ChatMessage
                  key="streaming-message"
                  role={"assistant" as MessageRole}
                  content={streamingContent}
                  isStreaming={!isThinking}
                  isThinking={isThinking}
                />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={isStreaming}
          placeholder={isStreaming ? 'AI is responding...' : 'Ask about your data...'}
        />
      </div>
    </div>
  )
}
