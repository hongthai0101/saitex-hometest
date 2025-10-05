import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  Res,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  UseGuards,
  Req,
} from '@nestjs/common'
import type { Response, Request } from 'express'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger'

import { InsightService } from './services/insight.service'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { ChatRequestDto, ChatStreamChunk } from './dto/chat-request.dto'
import { Conversation } from './entities/conversation.entity'

// Demo user ID - in production this would come from JWT token
const DEMO_USER_ID = 'a81bc81b-dead-4e5d-abff-90865d1e13b1'

// Import your auth guard
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('insights')
@Controller('insights')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is set up
export class InsightController {
  constructor(private readonly insightService: InsightService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created successfully', type: Conversation })
  async createConversation(@Body() dto: CreateConversationDto): Promise<Conversation> {
    return this.insightService.createConversation(dto)
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for the current user' })
  @ApiQuery({ name: 'userId', description: 'User ID (demo mode uses default)' })
  @ApiResponse({ status: 200, description: 'List of conversations' })
  async getConversations(@Query('userId') userIdParam?: string): Promise<{ data: Conversation[] }> {
    const userId = userIdParam || DEMO_USER_ID
    const conversations = await this.insightService.getUserConversations(userId)
    return { data: conversations }
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get a specific conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiQuery({ name: 'userId', description: 'User ID (demo mode uses default)' })
  @ApiResponse({ status: 200, description: 'Conversation details' })
  async getConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userId') userIdParam?: string
  ): Promise<Conversation> {
    // Use provided userId or fall back to demo user
    const userId = userIdParam || DEMO_USER_ID
    return this.insightService.getConversation(id, userId)
  }

  @Patch('conversations/:id')
  @ApiOperation({ summary: 'Update conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiQuery({ name: 'userId', description: 'User ID (demo mode uses default)' })
  @ApiResponse({ status: 200, description: 'Conversation updated successfully' })
  async updateConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<CreateConversationDto>,
    @Query('userId') userIdParam?: string,
  ): Promise<Conversation> {
    // Use provided userId or fall back to demo user
    const userId = userIdParam || DEMO_USER_ID
    return this.insightService.updateConversation(id, userId, { title: updateData.title || 'Updated Conversation' })
  }

  @Patch('conversations/:id/pin')
  @ApiOperation({ summary: 'Toggle pin status of a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiQuery({ name: 'userId', description: 'User ID (demo mode uses default)' })
  @ApiResponse({ status: 200, description: 'Conversation pin status updated successfully' })
  async togglePinConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userId') userIdParam?: string,
  ): Promise<Conversation> {
    // Use provided userId or fall back to demo user
    const userId = userIdParam || DEMO_USER_ID
    return this.insightService.togglePinConversation(id, userId)
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Delete a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiQuery({ name: 'userId', description: 'User ID (demo mode uses default)' })
  @ApiResponse({ status: 204, description: 'Conversation deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userId') userIdParam?: string
  ): Promise<void> {
    // Use provided userId or fall back to demo user
    const userId = userIdParam || DEMO_USER_ID
    await this.insightService.deleteConversation(id, userId)
  }

  @Get('messages/:conversationId')
  @ApiOperation({ summary: 'Get all messages for a conversation' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({ status: 200, description: 'List of messages' })
  async getMessages(@Param('conversationId', ParseUUIDPipe) conversationId: string) {
    const messages = await this.insightService.getMessages(conversationId)
    return { data: messages }
  }

  @Post('chat')
  @ApiOperation({
    summary: 'Send a chat message and receive streaming response',
    description: 'Send a message to the AI assistant and receive a streaming response with data insights',
  })
  @ApiResponse({
    status: 200,
    description: 'Streaming response with chat chunks',
    content: {
      'text/plain': {
        schema: {
          type: 'string',
          description: 'Server-Sent Events stream of chat response chunks',
        },
      },
    },
  })
  async chat(@Body() dto: ChatRequestDto, @Res() res: Response): Promise<void> {
    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control')

    // For non-streaming clients, you might want to set different headers
    if (!dto.stream) {
      res.setHeader('Content-Type', 'application/json')
    }

    try {
      if (dto.stream) {
        // Stream response using Server-Sent Events format
        const responseStream = this.insightService.processChatMessage(dto)

        for await (const chunk of responseStream) {
          const data = JSON.stringify(chunk)
          res.write(`data: ${data}\n\n`)

          if (chunk.finished) {
            break
          }
        }

        res.write('data: [DONE]\n\n')
        res.end()
      } else {
        // Non-streaming response - collect all chunks
        const chunks: ChatStreamChunk[] = []
        const responseStream = this.insightService.processChatMessage(dto)

        for await (const chunk of responseStream) {
          chunks.push(chunk)
          if (chunk.finished) {
            break
          }
        }

        const fullResponse = {
          content: chunks.map(c => c.content).join(''),
          usage: chunks[chunks.length - 1]?.usage,
          sqlQuery: chunks.find(c => c.sqlQuery)?.sqlQuery,
          sqlResult: chunks.find(c => c.sqlResult)?.sqlResult,
          metadata: chunks[chunks.length - 1]?.metadata,
        }

        res.json(fullResponse)
      }
    } catch (error) {
      if (dto.stream) {
        res.write(`data: ${JSON.stringify({
          content: 'An error occurred while processing your request.',
          finished: true,
          error: true,
        })}\n\n`)
        res.write('data: [DONE]\n\n')
        res.end()
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'An error occurred while processing your request.',
          message: error.message,
        })
      }
    }
  }

  @Get('examples')
  @ApiOperation({ summary: 'Get example queries' })
  @ApiResponse({
    status: 200,
    description: 'List of example queries',
  })
  async getExamples() {
    const examples = [
      {
        id: 1,
        category: 'Sales Analysis',
        title: 'Revenue Trends',
        query: 'Show me the total revenue for each month this year',
        description: 'Analyze monthly revenue patterns and identify trends',
      },
      {
        id: 2,
        category: 'Customer Insights',
        title: 'Customer Growth',
        query: 'How many new customers did we acquire in the last quarter?',
        description: 'Track customer acquisition and growth metrics',
      },
      {
        id: 3,
        category: 'Product Performance',
        title: 'Top Products',
        query: 'What are our top 5 best-selling products this month?',
        description: 'Identify best-performing products by sales volume',
      },
      {
        id: 4,
        category: 'User Engagement',
        title: 'Active Users',
        query: 'Show me daily active users for the past week',
        description: 'Monitor user engagement and activity patterns',
      },
      {
        id: 5,
        category: 'Financial Overview',
        title: 'Profit Margins',
        query: 'Calculate the average profit margin by product category',
        description: 'Analyze profitability across different product lines',
      },
      {
        id: 6,
        category: 'Geographic Analysis',
        title: 'Regional Sales',
        query: 'Break down sales by region for the current quarter',
        description: 'Understand geographic distribution of sales',
      },
      {
        id: 7,
        category: 'Customer Behavior',
        title: 'Purchase Frequency',
        query: 'What is the average purchase frequency of our customers?',
        description: 'Understand customer buying patterns',
      },
      {
        id: 8,
        category: 'Inventory',
        title: 'Stock Levels',
        query: 'Which products have low stock levels (less than 10 units)?',
        description: 'Monitor inventory levels and identify restocking needs',
      },
    ]

    return {
      categories: [...new Set(examples.map(e => e.category))],
      examples,
      totalCount: examples.length,
    }
  }

  @Get('metrics/summary')
  @ApiOperation({ summary: 'Get summary metrics for dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Summary metrics',
  })
  async getSummaryMetrics() {
    // This would typically fetch from database
    // For now, returning mock data
    return {
      totalConversations: 42,
      totalMessages: 156,
      averageResponseTime: 1250, // ms
      tokensUsed: {
        today: 15000,
        thisMonth: 450000,
        limit: 1000000,
      },
      popularQueries: [
        'Revenue analysis',
        'Customer segmentation',
        'Product performance',
      ],
      lastActivity: new Date().toISOString(),
    }
  }
}