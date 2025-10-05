import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm'
import { Message } from './message.entity'

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string

  @Column({ name: 'user_id' })
  userId: string

  @Column({ name: 'total_tokens', default: 0 })
  totalTokens: number

  @Column({ name: 'total_cost', type: 'decimal', precision: 10, scale: 6, default: 0 })
  totalCost: number

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>

  @Column({ name: 'is_pinned', default: false })
  isPinned: boolean

  @OneToMany(() => Message, (message) => message.conversation, { cascade: true })
  messages: Message[]

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date
}