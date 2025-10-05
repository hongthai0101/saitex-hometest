import type {
  ChatExample,
  ChatRequest,
  ChatStreamChunk,
  Conversation,
  Message,
} from '@/types/chat'
import {apiService} from './api'

class ChatService {
  async getConversations(userId: string): Promise<Conversation[]> {
    const response = await apiService.get<Conversation[]>(
      `/insights/conversations?userId=${userId}`
    )
    return response.data
  }

  async getConversation(id: string, userId: string): Promise<Conversation> {
    const response = await apiService.get<Conversation>(`/insights/conversations/${id}?userId=${userId}`)
    return response.data
  }

  async createConversation(userId: string, title: string): Promise<Conversation> {
    const response = await apiService.post<Conversation>('/insights/conversations', {userId, title})
    return response.data
  }

  async updateConversation(
    id: string,
    userId: string,
    data: {title: string}
  ): Promise<Conversation> {
    const response = await apiService.patch<Conversation>(
      `/insights/conversations/${id}?userId=${userId}`,
      data
    )
    return response.data
  }

  async togglePinConversation(id: string, userId: string): Promise<Conversation> {
    const response = await apiService.patch<Conversation>(
      `/insights/conversations/${id}/pin?userId=${userId}`,
      {}
    )
    return response.data
  }

  async deleteConversation(id: string, userId: string): Promise<void> {
    await apiService.delete(`/insights/conversations/${id}?userId=${userId}`)
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await apiService.get<Message[]>(
      `/insights/messages/${conversationId}`
    )
    return response.data
  }

  async *streamChat(request: ChatRequest): AsyncGenerator<ChatStreamChunk> {
    // Use axios instance for streaming
    const api = apiService.getInstance()
    const response = await api.post('/insights/chat', {...request, stream: true}, {
      responseType: 'stream',
      adapter: 'fetch', // Use fetch adapter for streaming
    })

    // Check if response is a ReadableStream
    const body = response.data as ReadableStream<Uint8Array>
    if (!body) {
      throw new Error('No response body')
    }

    const reader = body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const {done, value} = await reader.read()

      if (done) break

      buffer += decoder.decode(value, {stream: true})
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()

          if (data === '[DONE]') {
            return
          }

          try {
            const chunk: ChatStreamChunk = JSON.parse(data)
            yield chunk

            if (chunk.finished) {
              return
            }
          } catch (e) {
            // Skip malformed chunks
          }
        }
      }
    }
  }

  async sendMessage(request: ChatRequest): Promise<Message> {
    const response = await apiService.post<Message>('/insights/chat', {...request, stream: false})
    return response.data
  }

  async getExamples(): Promise<ChatExample[]> {
    const response = await apiService.get<{examples: ChatExample[]}>('/insights/examples')
    return response.data.examples
  }
}

export const chatService = new ChatService()
