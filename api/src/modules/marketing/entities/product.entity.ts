import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm'
import { OrderItem } from './order-item.entity'

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column()
  sku: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'cost_price' })
  costPrice: number

  @Column()
  category: string

  @Column({ nullable: true })
  brand?: string

  @Column({ default: 0, name: 'stock_quantity' })
  stockQuantity: number

  @Column({ default: 0, name: 'total_sold' })
  totalSold: number

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'total_revenue' })
  totalRevenue: number

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number

  @Column({ default: 0, name: 'review_count' })
  reviewCount: number

  @Column({ default: true, name: 'is_active' })
  isActive: boolean

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[]

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date
}