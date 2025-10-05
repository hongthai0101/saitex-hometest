import {cn} from '@/lib/utils'
import type {Message, MessageRole} from '@/types/chat'
import {Bot, Loader2, User} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatMessageProps {
  message?: Message
  role: MessageRole
  content: string
  isStreaming?: boolean
  isThinking?: boolean
}

export function ChatMessage({
  message,
  role,
  content,
  isStreaming = false,
  isThinking = false,
}: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={cn('flex gap-3 px-4 py-6', isUser ? 'flex-row-reverse' : 'flex-row', !isUser && 'bg-gray-50')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
        )}
      >
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      <div className={cn('flex-1 space-y-2', isUser && 'flex flex-col items-end')}>
        <div className="flex items-center gap-2">
          {isThinking && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Loader2 size={12} className="animate-spin" />
              Thinking...
            </span>
          )}
        </div>

        <div className={cn('prose prose-sm max-w-none', isUser && 'text-right')}>
          {isUser ? (
            <p className="whitespace-pre-wrap text-gray-800">{content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({node, ...props}) => (
                  <div className="my-4 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300 border" {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => (
                  <thead className="bg-gray-50" {...props} />
                ),
                th: ({node, ...props}) => (
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900" {...props} />
                ),
                td: ({node, ...props}) => (
                  <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-700" {...props} />
                ),
                tr: ({node, ...props}) => (
                  <tr className="border-b border-gray-200" {...props} />
                ),
                code: ({node, className, children, ...props}: any) => {
                  const isInline = !className?.includes('language-')
                  const isSql = className?.includes('language-sql')
                  return isInline ? (
                    <code className="rounded bg-gray-100 px-1 py-0.5 text-xs font-mono text-gray-800" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code
                      className={cn(
                        "block rounded p-3 text-xs font-mono whitespace-pre overflow-x-auto",
                        isSql ? "bg-gray-900 text-green-400" : "bg-gray-100 text-gray-800"
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
                pre: ({node, ...props}) => (
                  <pre className="my-2 max-h-96 overflow-auto rounded bg-transparent" {...props} />
                ),
                ul: ({node, ...props}) => (
                  <ul className="my-2 list-disc pl-6 space-y-1" {...props} />
                ),
                ol: ({node, ...props}) => (
                  <ol className="my-2 list-decimal pl-6 space-y-1" {...props} />
                ),
                li: ({node, ...props}) => (
                  <li className="text-gray-800" {...props} />
                ),
                p: ({node, ...props}) => (
                  <p className="my-2 text-gray-800" {...props} />
                ),
                h1: ({node, ...props}) => (
                  <h1 className="my-3 text-2xl font-bold text-gray-900" {...props} />
                ),
                h2: ({node, ...props}) => (
                  <h2 className="my-3 text-xl font-bold text-gray-900" {...props} />
                ),
                h3: ({node, ...props}) => (
                  <h3 className="my-2 text-lg font-semibold text-gray-900" {...props} />
                ),
                blockquote: ({node, ...props}) => (
                  <blockquote className="my-2 border-l-4 border-gray-300 pl-4 italic text-gray-700" {...props} />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          )}
          {isStreaming && <span className="inline-block h-4 w-1 animate-pulse bg-gray-400" />}
        </div>

        {message?.sqlQuery && (
          <details className="mt-2 w-full rounded-lg border bg-white p-3">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              📊 SQL Query
            </summary>
            <div className="mt-2 max-h-60 overflow-auto rounded bg-gray-900">
              <pre className="p-3 text-xs overflow-x-auto whitespace-nowrap">
                <code className="text-green-400 font-mono">{message.sqlQuery}</code>
              </pre>
            </div>
          </details>
        )}

        {message?.sqlResult !== undefined && message.sqlResult !== null ? (
          <details className="mt-2 w-full rounded-lg border bg-white p-3">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              📋 Query Result ({Array.isArray(message.sqlResult) ? `${message.sqlResult.length} rows` : 'data'})
            </summary>
            <div className="mt-2 max-h-96 overflow-auto rounded bg-gray-50 border">
              <pre className="p-3 text-xs">
                <code className="text-gray-800 font-mono">{String(JSON.stringify(message.sqlResult, null, 2))}</code>
              </pre>
            </div>
          </details>
        ) : null}
      </div>
    </div>
  )
}
