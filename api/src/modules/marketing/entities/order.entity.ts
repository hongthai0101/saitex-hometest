import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm'
import { Customer } from './customer.entity'
import { OrderItem } from './order-item.entity'

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'customer_id' })
  customerId: string

  @Column({ name: 'order_number', unique: true })
  orderNumber: string

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  })
  status: string

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'subtotal_amount' })
  subtotalAmount: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'tax_amount' })
  taxAmount: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'shipping_amount' })
  shippingAmount: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'discount_amount' })
  discountAmount: number

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number

  @Column({
    type: 'enum',
    enum: ['card', 'cash', 'bank_transfer', 'paypal', 'crypto'],
    name: 'payment_method',
  })
  paymentMethod: string

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
    name: 'payment_status',
  })
  paymentStatus: string

  @Column({ nullable: true, name: 'shipping_address' })
  shippingAddress?: string

  @Column({ nullable: true, name: 'coupon_code' })
  couponCode?: string

  @Column({ type: 'text', nullable: true })
  notes?: string

  @ManyToOne(() => Customer, (customer) => customer.orders)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  orderItems: OrderItem[]

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}