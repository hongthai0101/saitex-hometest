import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm'
import { Order } from './order.entity'

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  email: string

  @Column({ name: 'first_name' })
  firstName: string

  @Column({ name: 'last_name' })
  lastName: string

  @Column({ nullable: true })
  phone?: string

  @Column({ type: 'date', nullable: true, name: 'date_of_birth' })
  dateOfBirth?: Date

  @Column({
    type: 'enum',
    enum: ['male', 'female', 'other'],
    nullable: true,
  })
  gender?: string

  @Column({ nullable: true })
  city?: string

  @Column({ nullable: true })
  country?: string

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'total_spent' })
  totalSpent: number

  @Column({ default: 0, name: 'order_count' })
  orderCount: number

  @Column({ type: 'date', nullable: true, name: 'last_order_date' })
  lastOrderDate?: Date

  @Column({
    type: 'enum',
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze',
    name: 'loyalty_tier',
  })
  loyaltyTier: string

  @Column({ default: true, name: 'is_active' })
  isActive: boolean

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[]

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date
}