import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { EventEmitter2 } from '@nestjs/event-emitter'

import { Conversation } from '../entities/conversation.entity'
import { Message, MessageRole, MessageType } from '../entities/message.entity'
import { CreateConversationDto } from '../dto/create-conversation.dto'
import { CreateMessageDto } from '../dto/create-message.dto'
import { ChatRequestDto, ChatStreamChunk } from '../dto/chat-request.dto'

import { OpenAIService, PromptAnalysisResult, SQLGenerationResult } from './openai.service'
import { SchemaAnalyzerService } from './schema-analyzer.service'

@Injectable()
export class InsightService {
  private readonly logger = new Logger(InsightService.name)

  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private dataSource: DataSource,
    private openaiService: OpenAIService,
    private schemaService: SchemaAnalyzerService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new conversation
   */
  async createConversation(dto: CreateConversationDto): Promise<Conversation> {
    const conversation = this.conversationRepository.create(dto)
    const saved = await this.conversationRepository.save(conversation)

    this.logger.log(`Created conversation ${saved.id} for user ${dto.userId}`)
    return saved
  }

  /**
   * Get conversation by ID with messages
   */
  async getConversation(id: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id, userId },
      relations: ['messages'],
      order: { messages: { createdAt: 'ASC' } },
    })

    if (!conversation) {
      throw new NotFoundException(`Conversation ${id} not found`)
    }

    return conversation
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: { userId },
      relations: ['messages'],
      order: { updatedAt: 'DESC' },
    })
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    })
  }

  /**
   * Process chat message and generate streaming response
   */
  async *processChatMessage(dto: ChatRequestDto): AsyncGenerator<ChatStreamChunk, void, unknown> {
    const startTime = Date.now()
    let conversation: Conversation | undefined

    try {
      // Get or create conversation
      this.logger.log(`=== PROCESS CHAT MESSAGE ===`)
      this.logger.log(`Received conversationId: ${dto.conversationId}`)
      this.logger.log(`User message: ${dto.message}`)

      if (dto.conversationId) {
        this.logger.log(`Loading existing conversation: ${dto.conversationId}`)
        conversation = await this.getConversation(dto.conversationId, dto.userId)
        this.logger.log(`Loaded conversation: ${conversation.id} - "${conversation.title}"`)
      } else {
        this.logger.log(`Creating NEW conversation`)
        conversation = await this.createConversation({
          title: dto.message.substring(0, 50),
          userId: dto.userId,
        })
        this.logger.log(`Created conversation: ${conversation.id} - "${conversation.title}"`)
      }

      // Save user message
      const userMessage = await this.createMessage({
        conversationId: conversation.id,
        role: MessageRole.USER,
        type: MessageType.TEXT,
        content: dto.message,
      })

      this.logger.log(`Processing message for conversation ${conversation.id}`)

      // Analyze prompt to determine if it's data-related
      const analysis = await this.openaiService.analyzePrompt(dto.message)
      this.logger.log(`Prompt analysis complete - isDataRelated: ${analysis.isDataRelated}, confidence: ${analysis.confidence}`)

      // If not data-related, provide suggestions
      if (!analysis.isDataRelated) {
        yield* this.handleNonDataRequest(conversation, analysis, dto.message)
        return
      }

      // Get database schema
      const schemas = await this.schemaService.getMarketingSchema()
      if (!schemas || schemas.length === 0) {
        const errorMessage = 'I apologize, but I don\'t have access to the database schema at the moment. Please try again later.'
        
        // Save error message
        await this.createMessage({
          conversationId: conversation.id,
          role: MessageRole.ASSISTANT,
          type: MessageType.ERROR,
          content: errorMessage,
          metadata: {
            error: 'No database schema available',
            timestamp: new Date().toISOString(),
          },
        })
        
        yield {
          content: errorMessage,
          finished: true,
          metadata: { conversationId: conversation.id },
        }
        return
      }

      // Generate SQL query
      const sqlResult = await this.openaiService.generateSQL(dto.message, schemas, analysis)

      // Validate and execute SQL
      const validation = await this.schemaService.validateSQL(sqlResult.sqlQuery, schemas)
      if (!validation.isValid) {
        const errorMessage = `I encountered an issue generating the SQL query: ${validation.errors.join(', ')}. Let me try a different approach.`
        
        // Save validation error message
        await this.createMessage({
          conversationId: conversation.id,
          role: MessageRole.ASSISTANT,
          type: MessageType.ERROR,
          content: errorMessage,
          metadata: {
            error: 'SQL validation failed',
            validationErrors: validation.errors,
            sqlQuery: sqlResult.sqlQuery,
            timestamp: new Date().toISOString(),
          },
        })
        
        yield {
          content: errorMessage,
          finished: false,
          metadata: { conversationId: conversation.id },
        }

        // Fallback to general response
        yield* this.generateGeneralResponse(conversation, dto.message)
        return
      }

      // Execute SQL query
      let queryData: any[] = []
      try {
        queryData = await this.dataSource.query(sqlResult.sqlQuery)
        this.logger.log(`Executed SQL query, returned ${queryData.length} rows`)
      } catch (error) {
        this.logger.error('SQL execution error:', error)
        const errorMessage = 'I encountered an error while retrieving the data. Please try rephrasing your question.'
        
        // Save SQL execution error message
        await this.createMessage({
          conversationId: conversation.id,
          role: MessageRole.ASSISTANT,
          type: MessageType.ERROR,
          content: errorMessage,
          sqlQuery: sqlResult.sqlQuery,
          metadata: {
            error: 'SQL execution failed',
            errorDetails: error.message,
            sqlQuery: sqlResult.sqlQuery,
            timestamp: new Date().toISOString(),
          },
        })
        
        yield {
          content: errorMessage,
          finished: true,
          metadata: { conversationId: conversation.id },
        }
        return
      }

      // Generate streaming response with data context
      const responseStream = this.openaiService.generateStreamingResponse(
        dto.message,
        sqlResult.explanation,
        queryData,
      )

      let responseContent = ''
      let tokenCount = 0

      for await (const chunk of responseStream) {
        responseContent += chunk
        tokenCount += 1 // Rough estimation

        yield {
          content: chunk,
          finished: false,
          sqlQuery: sqlResult.sqlQuery,
          sqlResult: queryData,
        }
      }

      // Save assistant response
      const processingTime = Date.now() - startTime
      const cost = this.openaiService.calculateCost(analysis.confidence * 100, tokenCount)

      await this.createMessage({
        conversationId: conversation.id,
        role: MessageRole.ASSISTANT,
        type: MessageType.DATA_RESULT,
        content: responseContent,
        promptTokens: Math.floor(analysis.confidence * 100),
        completionTokens: tokenCount,
        totalTokens: Math.floor(analysis.confidence * 100) + tokenCount,
        cost,
        sqlQuery: sqlResult.sqlQuery,
        sqlResult: queryData,
        processingTime,
        metadata: {
          analysis,
          sqlGeneration: sqlResult,
        },
      })

      // Update conversation totals
      await this.updateConversationTotals(conversation.id)

      // Final chunk with complete information
      yield {
        content: '',
        finished: true,
        usage: {
          promptTokens: Math.floor(analysis.confidence * 100),
          completionTokens: tokenCount,
          totalTokens: Math.floor(analysis.confidence * 100) + tokenCount,
        },
        sqlQuery: sqlResult.sqlQuery,
        sqlResult: queryData,
        metadata: {
          processingTime,
          cost,
          conversationId: conversation.id,
        },
      }

      // Emit event for analytics
      this.eventEmitter.emit('insight.query.completed', {
        userId: dto.userId,
        conversationId: conversation.id,
        query: dto.message,
        sqlQuery: sqlResult.sqlQuery,
        resultCount: queryData.length,
        processingTime,
        cost,
      })

    } catch (error) {
      this.logger.error('Error processing chat message:', error)
      const errorMessage = 'I apologize, but I encountered an unexpected error. Please try again.'
      
      // Save general error message if conversation exists
      if (conversation) {
        await this.createMessage({
          conversationId: conversation.id,
          role: MessageRole.ASSISTANT,
          type: MessageType.ERROR,
          content: errorMessage,
          metadata: {
            error: 'Unexpected error',
            errorDetails: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
          },
        })
      }
      
      yield {
        content: errorMessage,
        finished: true,
        metadata: conversation ? { conversationId: conversation.id } : undefined,
      }
    }
  }

  /**
   * Handle non-data related requests with suggestions
   */
  private async *handleNonDataRequest(
    conversation: Conversation,
    analysis: PromptAnalysisResult,
    userMessage: string,
  ): AsyncGenerator<ChatStreamChunk, void, unknown> {
    const suggestions = analysis.suggestedQueries || [
      'Show me total sales for this month',
      'How many active customers do we have?',
      'What are our top performing products?',
      'Generate a weekly performance report',
      'Show customer acquisition trends',
    ]

    const responseText = `I understand you're asking about "${userMessage}", but I'm specifically designed to help with business data insights and reports.

Here are some questions I can help you with:

${suggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join('\n')}

Feel free to ask me anything about your business data, statistics, or reports!`

    // Stream the response (but not the final chunk yet)
    const words = responseText.split(' ')
    for (let i = 0; i < words.length; i++) {
      const chunk = words[i] + (i < words.length - 1 ? ' ' : '')
      yield {
        content: chunk,
        finished: false, // Keep streaming, don't mark as finished yet
      }

      // Small delay for better streaming effect
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    // Save the suggestion message BEFORE sending final chunk
    await this.createMessage({
      conversationId: conversation.id,
      role: MessageRole.ASSISTANT,
      type: MessageType.SUGGESTION,
      content: responseText,
      metadata: { suggestions, analysis },
    })
    
    // Now send the final chunk with conversationId
    yield {
      content: '',
      finished: true,
      metadata: { conversationId: conversation.id },
    }
  }

  /**
   * Generate general response when SQL fails
   */
  private async *generateGeneralResponse(
    conversation: Conversation,
    userMessage: string,
  ): AsyncGenerator<ChatStreamChunk, void, unknown> {
    const responseStream = this.openaiService.generateStreamingResponse(
      userMessage,
      'The user is asking about business data, but I could not generate a valid SQL query. Provide a helpful general response and suggest they rephrase their question.',
    )

    let responseContent = ''
    for await (const chunk of responseStream) {
      responseContent += chunk
      yield {
        content: chunk,
        finished: false,
      }
    }

    // Save the message before sending final chunk
    await this.createMessage({
      conversationId: conversation.id,
      role: MessageRole.ASSISTANT,
      type: MessageType.TEXT,
      content: responseContent,
    })

    // Send final chunk with conversationId
    yield {
      content: '',
      finished: true,
      metadata: { conversationId: conversation.id },
    }
  }

  /**
   * Create a new message
   */
  private async createMessage(dto: CreateMessageDto & Partial<Message>): Promise<Message> {
    const message = this.messageRepository.create(dto)
    return this.messageRepository.save(message)
  }

  /**
   * Update conversation token and cost totals
   */
  private async updateConversationTotals(conversationId: string): Promise<void> {
    const result = await this.messageRepository
      .createQueryBuilder('message')
      .select('SUM(message.totalTokens)', 'totalTokens')
      .addSelect('SUM(message.cost)', 'totalCost')
      .where('message.conversationId = :conversationId', { conversationId })
      .getRawOne()

    await this.conversationRepository.update(conversationId, {
      totalTokens: parseInt(result.totalTokens) || 0,
      totalCost: parseFloat(result.totalCost) || 0,
    })
  }

  /**
   * Update conversation
   */
  async updateConversation(id: string, userId: string, updateData: { title: string }): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id, userId },
      relations: ['messages'],
    })

    if (!conversation) {
      throw new NotFoundException(`Conversation ${id} not found`)
    }

    await this.conversationRepository.update(id, { title: updateData.title })

    const updatedConversation = await this.conversationRepository.findOne({
      where: { id, userId },
      relations: ['messages'],
      order: { messages: { createdAt: 'ASC' } },
    })

    this.logger.log(`Updated conversation ${id} title to "${updateData.title}"`)
    return updatedConversation!
  }

  /**
   * Toggle pin status of conversation
   */
  async togglePinConversation(id: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id, userId },
    })

    if (!conversation) {
      throw new NotFoundException(`Conversation ${id} not found`)
    }

    const newPinStatus = !conversation.isPinned
    await this.conversationRepository.update(id, { isPinned: newPinStatus })

    const updatedConversation = await this.conversationRepository.findOne({
      where: { id, userId },
    })

    this.logger.log(`Toggled pin status for conversation ${id} to ${newPinStatus}`)
    return updatedConversation!
  }

  /**
   * Delete conversation and all messages
   */
  async deleteConversation(id: string, userId: string): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id, userId },
    })

    if (!conversation) {
      throw new NotFoundException(`Conversation ${id} not found`)
    }

    await this.conversationRepository.softDelete(id)
    this.logger.log(`Deleted conversation ${id}`)
  }

  /**
   * Get conversation statistics
   */
  async getConversationStats(conversationId: string): Promise<any> {
    const stats = await this.messageRepository
      .createQueryBuilder('message')
      .select('COUNT(*)', 'messageCount')
      .addSelect('SUM(message.totalTokens)', 'totalTokens')
      .addSelect('SUM(message.cost)', 'totalCost')
      .addSelect('AVG(message.processingTime)', 'avgProcessingTime')
      .where('message.conversationId = :conversationId', { conversationId })
      .getRawOne()

    return {
      messageCount: parseInt(stats.messageCount) || 0,
      totalTokens: parseInt(stats.totalTokens) || 0,
      totalCost: parseFloat(stats.totalCost) || 0,
      avgProcessingTime: parseFloat(stats.avgProcessingTime) || 0,
    }
  }
}