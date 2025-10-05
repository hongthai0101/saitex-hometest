import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateConversationDto {
  @ApiProperty({ description: 'Conversation title' })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({ description: 'User ID who owns this conversation' })
  @IsUUID()
  @IsNotEmpty()
  userId: string

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  metadata?: Record<string, any>
}