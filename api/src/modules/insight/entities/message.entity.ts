import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Conversation } from './conversation.entity'

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

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'conversation_id' })
  conversationId: string

  @Column({
    type: 'enum',
    enum: MessageRole,
    default: MessageRole.USER,
  })
  role: MessageRole

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType

  @Column({ type: 'text' })
  content: string

  @Column({ name: 'prompt_tokens', default: 0 })
  promptTokens: number

  @Column({ name: 'completion_tokens', default: 0 })
  completionTokens: number

  @Column({ name: 'total_tokens', default: 0 })
  totalTokens: number

  @Column({ name: 'cost', type: 'decimal', precision: 10, scale: 6, default: 0 })
  cost: number

  @Column({ name: 'sql_query', type: 'text', nullable: true })
  sqlQuery?: string

  @Column({ name: 'sql_result', type: 'jsonb', nullable: true })
  sqlResult?: any

  @Column({ name: 'processing_time', nullable: true })
  processingTime?: number

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}