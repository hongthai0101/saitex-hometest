import { IsString, IsNotEmpty, IsUUID, IsOptional, IsBoolean } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ChatRequestDto {
  @ApiProperty({ description: 'User message content' })
  @IsString()
  @IsNotEmpty()
  message: string

  @ApiProperty({ description: 'Conversation ID (optional for new conversations)', required: false })
  @IsUUID()
  @IsOptional()
  conversationId?: string

  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  @IsNotEmpty()
  userId: string

  @ApiProperty({ description: 'Whether to stream the response', default: true })
  @IsBoolean()
  @IsOptional()
  stream?: boolean = true
}

export class ChatStreamChunk {
  @ApiProperty({ description: 'Chunk content' })
  content: string

  @ApiProperty({ description: 'Whether this is the last chunk' })
  finished: boolean

  @ApiProperty({ description: 'Token usage information', required: false })
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }

  @ApiProperty({ description: 'SQL query generated', required: false })
  sqlQuery?: string

  @ApiProperty({ description: 'SQL result data', required: false })
  sqlResult?: any

  @ApiProperty({ description: 'Message metadata', required: false })
  metadata?: Record<string, any>
}