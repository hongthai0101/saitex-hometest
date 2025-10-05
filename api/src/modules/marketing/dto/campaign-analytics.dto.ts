import { IsEnum, IsOptional, IsDateString, IsArray, IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CampaignPlatform } from '../entities/campaign.entity';

export class AnalyticsFilterDto {
  @ApiProperty({ description: 'Start date for analytics', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date for analytics', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ enum: CampaignPlatform, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(CampaignPlatform, { each: true })
  platforms?: CampaignPlatform[];

  @ApiProperty({ description: 'Campaign IDs to filter', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campaignIds?: string[];

  @ApiProperty({ description: 'Group results by time period', enum: ['day', 'week', 'month'], required: false })
  @IsOptional()
  @IsEnum(['day', 'week', 'month'])
  groupBy?: 'day' | 'week' | 'month';
}

export class DashboardMetricsDto {
  @ApiProperty({ description: 'Total spend across all platforms' })
  totalSpend: number;

  @ApiProperty({ description: 'Total impressions' })
  totalImpressions: number;

  @ApiProperty({ description: 'Total clicks' })
  totalClicks: number;

  @ApiProperty({ description: 'Overall click-through rate' })
  averageCtr: number;

  @ApiProperty({ description: 'Average cost per click' })
  averageCpc: number;

  @ApiProperty({ description: 'Total conversions' })
  totalConversions: number;

  @ApiProperty({ description: 'Total conversion value' })
  totalConversionValue: number;

  @ApiProperty({ description: 'Overall conversion rate' })
  averageConversionRate: number;

  @ApiProperty({ description: 'Return on ad spend' })
  roas: number;

  @ApiProperty({ description: 'Cost per conversion' })
  costPerConversion: number;

  @ApiProperty({ description: 'Platform breakdown' })
  platformBreakdown: {
    platform: string;
    spend: number;
    conversions: number;
    roas: number;
  }[];
}

export class CampaignPerformanceDto {
  @ApiProperty({ description: 'Campaign ID' })
  campaignId: string;

  @ApiProperty({ description: 'Campaign name' })
  campaignName: string;

  @ApiProperty({ description: 'Platform' })
  platform: string;

  @ApiProperty({ description: 'Campaign metrics' })
  metrics: {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    conversions: number;
    conversionValue: number;
    conversionRate: number;
    roas: number;
  };

  @ApiProperty({ description: 'Performance trend (7-day comparison)' })
  trend: {
    spendChange: number;
    clicksChange: number;
    conversionsChange: number;
    roasChange: number;
  };
}

export class TimeSeriesDataDto {
  @ApiProperty({ description: 'Date' })
  date: string;

  @ApiProperty({ description: 'Metrics for the date' })
  metrics: {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    conversionValue: number;
  };

  @ApiProperty({ description: 'Platform breakdown for the date' })
  platformData?: {
    platform: string;
    spend: number;
    clicks: number;
    conversions: number;
  }[];
}

export class NaturalLanguageQueryDto {
  @ApiProperty({ description: 'Natural language query', example: 'Show me Facebook ad performance last month' })
  @IsString()
  query: string;

  @ApiProperty({ description: 'Context for the query', required: false })
  @IsOptional()
  @IsObject()
  context?: {
    dateRange?: {
      start: string;
      end: string;
    };
    platforms?: string[];
    campaigns?: string[];
  };
}

export class QueryResponseDto {
  @ApiProperty({ description: 'Interpreted query parameters' })
  interpretation: {
    intent: string;
    entities: {
      platforms?: string[];
      metrics?: string[];
      timeRange?: {
        start: string;
        end: string;
      };
      campaigns?: string[];
    };
  };

  @ApiProperty({ description: 'Query results data' })
  data: any;

  @ApiProperty({ description: 'Suggested follow-up questions' })
  suggestions: string[];

  @ApiProperty({ description: 'Natural language response' })
  response: string;
}