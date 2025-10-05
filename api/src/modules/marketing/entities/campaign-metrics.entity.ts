import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { MarketingCampaign } from './campaign.entity';

@Entity('campaign_metrics')
@Index(['campaignId', 'date'])
@Index(['date', 'platform'])
@Unique(['campaignId', 'date']) // Ensure one record per campaign per day
export class CampaignMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'campaign_id' })
  campaignId: string;

  @Column({ type: 'date' })
  @Index()
  date: Date;

  @Column()
  platform: string;

  // Core Metrics
  @Column({ type: 'bigint', default: 0 })
  impressions: number;

  @Column({ type: 'bigint', default: 0 })
  clicks: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  ctr: number; // Click-through rate

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  spend: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cpc: number; // Cost per click

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cpm: number; // Cost per mille (thousand impressions)

  // Conversion Metrics
  @Column({ type: 'bigint', default: 0 })
  conversions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  conversionValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  conversionRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costPerConversion: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  roas: number; // Return on ad spend

  // Engagement Metrics
  @Column({ type: 'bigint', default: 0 })
  videoViews: number;

  @Column({ type: 'bigint', default: 0 })
  likes: number;

  @Column({ type: 'bigint', default: 0 })
  shares: number;

  @Column({ type: 'bigint', default: 0 })
  comments: number;

  @Column({ type: 'bigint', default: 0 })
  saves: number;

  // Reach Metrics
  @Column({ type: 'bigint', default: 0 })
  reach: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  frequency: number;

  @Column({ type: 'bigint', default: 0 })
  uniqueClicks: number;

  // Quality Metrics
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  qualityScore: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  relevanceScore: number;

  // Platform-specific metrics stored as JSON
  @Column({ type: 'json', nullable: true })
  platformSpecificMetrics: Record<string, any>;

  // Calculated fields
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cpuv: number; // Cost per unique view

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cpe: number; // Cost per engagement

  // Relationships
  @ManyToOne(() => MarketingCampaign, campaign => campaign.metrics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: MarketingCampaign;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}