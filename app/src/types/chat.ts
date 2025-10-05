export interface Conversation {
  id: string
  title: string
  userId: string
  totalTokens: number
  totalCost: number
  metadata?: Record<string, unknown>
  messages?: Message[]
  createdAt: string
  updatedAt: string
  isPinned?: boolean
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum MessageType {
  TEXT = 'text',
  SQL_QUERY = 'sql_query',
  DATA_RESULT = 'data_result',
  SUGGESTION = 'suggestion',
  ERROR = 'error',
}

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  type: MessageType
  content: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
  sqlQuery?: string
  sqlResult?: unknown
  processingTime?: number
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface ChatStreamChunk {
  content: string
  finished: boolean
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  sqlQuery?: string
  sqlResult?: unknown
  metadata?: Record<string, unknown>
}

export interface ChatRequest {
  message: string
  conversationId?: string
  userId: string
  stream?: boolean
}

export interface ChatExample {
  id: number
  category: string
  title: string
  query: string
  description: string
}
