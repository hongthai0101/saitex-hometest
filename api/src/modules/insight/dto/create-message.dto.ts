import { IsString, IsNotEmpty, IsUUID, IsEnum, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { MessageRole, MessageType } from '../entities/message.entity'

export class CreateMessageDto {
  @ApiProperty({ description: 'Conversation ID' })
  @IsUUID()
  @IsNotEmpty()
  conversationId: string

  @ApiProperty({ enum: MessageRole, description: 'Message role' })
  @IsEnum(MessageRole)
  role: MessageRole

  @ApiProperty({ enum: MessageType, description: 'Message type', required: false })
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType

  @ApiProperty({ description: 'Message content' })
  @IsString()
  @IsNotEmpty()
  content: string

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  metadata?: Record<string, any>
}