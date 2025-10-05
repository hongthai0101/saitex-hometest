import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm'
import { CampaignMetrics } from './campaign-metrics.entity'

export enum CampaignPlatform {
  GOOGLE_ADS = 'google_ads',
  FACEBOOK_ADS = 'facebook_ads',
  INSTAGRAM = 'instagram',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  TIKTOK = 'tiktok',
  EMAIL = 'email',
  SMS = 'sms',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
  COMPLETED = 'completed',
}

export enum CampaignObjective {
  TRAFFIC = 'traffic',
  BRAND_AWARENESS = 'brand_awareness',
  CONVERSIONS = 'conversions',
  CATALOG_SALES = 'catalog_sales',
  VIDEO_VIEWS = 'video_views',
  MESSAGES = 'messages',
  STORE_TRAFFIC = 'store_traffic',
  REACH = 'reach',
  ENGAGEMENT = 'engagement',
  APP_INSTALLS = 'app_installs',
  LEAD_GENERATION = 'lead_generation',
}

@Entity('marketing_campaigns')
export class MarketingCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({
    type: 'enum',
    enum: ['email', 'sms', 'social_media', 'display', 'search', 'influencer'],
  })
  type: string

  @Column({
    type: 'enum',
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft',
  })
  status: string

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  budget: number

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'spent_amount' })
  spentAmount: number

  @Column({ default: 0 })
  impressions: number

  @Column({ default: 0 })
  clicks: number

  @Column({ default: 0 })
  conversions: number

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  revenue: number

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0, name: 'click_through_rate' })
  clickThroughRate: number

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0, name: 'conversion_rate' })
  conversionRate: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'cost_per_click' })
  costPerClick: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'cost_per_acquisition' })
  costPerAcquisition: number

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'return_on_ad_spend' })
  returnOnAdSpend: number

  @Column({ nullable: true, name: 'target_audience' })
  targetAudience?: string

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>

  @Column({ nullable: true, name: 'external_id' })
  externalId?: string

  @Column({ nullable: true })
  platform?: string

  @Column({
    type: 'enum',
    enum: CampaignObjective,
    nullable: true
  })
  objective?: CampaignObjective

  @Column({ nullable: true, name: 'user_id' })
  userId?: string

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'daily_budget' })
  dailyBudget?: number

  @Column({ type: 'jsonb', nullable: true })
  targeting?: Record<string, any>

  @Column({ type: 'jsonb', nullable: true, name: 'creative_assets' })
  creativeAssets?: Record<string, any>

  @Column({ type: 'jsonb', nullable: true, name: 'platform_specific_data' })
  platformSpecificData?: Record<string, any>

  @OneToMany(() => CampaignMetrics, metrics => metrics.campaign)
  metrics: CampaignMetrics[]

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date
}