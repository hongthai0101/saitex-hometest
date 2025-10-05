import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MarketingCampaign, CampaignPlatform } from '../entities/campaign.entity';
import { CampaignMetrics } from '../entities/campaign-metrics.entity';
import {
  DashboardMetricsDto,
  CampaignPerformanceDto,
  TimeSeriesDataDto,
  AnalyticsFilterDto
} from '../dto/campaign-analytics.dto';

export interface PlatformMetrics {
  platform: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue: number;
  ctr: number;
  cpc: number;
  roas: number;
}

interface TrendData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

@Injectable()
export class AnalyticsAggregationService {
  private readonly logger = new Logger(AnalyticsAggregationService.name);

  constructor(
    @InjectRepository(MarketingCampaign)
    private readonly campaignRepository: Repository<MarketingCampaign>,
    @InjectRepository(CampaignMetrics)
    private readonly metricsRepository: Repository<CampaignMetrics>,
  ) {}

  /**
   * Get dashboard overview metrics
   */
  async getDashboardMetrics(
    userId: string,
    filters: AnalyticsFilterDto
  ): Promise<DashboardMetricsDto> {
    try {
      this.logger.log(`Getting dashboard metrics for user ${userId}`);

      const { startDate, endDate, platforms, campaignIds } = filters;

      // Build date range
      const dateRange = this.buildDateRange(startDate, endDate);

      // Get aggregated metrics across all platforms
      const metrics = await this.getAggregatedMetrics(
        userId,
        dateRange.start,
        dateRange.end,
        platforms,
        campaignIds
      );

      // Get platform breakdown
      const platformBreakdown = await this.getPlatformBreakdown(
        userId,
        dateRange.start,
        dateRange.end,
        platforms,
        campaignIds
      );

      // Calculate derived metrics
      const dashboard: DashboardMetricsDto = {
        totalSpend: metrics.spend,
        totalImpressions: metrics.impressions,
        totalClicks: metrics.clicks,
        totalConversions: metrics.conversions,
        totalConversionValue: metrics.conversionValue,
        averageCtr: metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0,
        averageCpc: metrics.clicks > 0 ? metrics.spend / metrics.clicks : 0,
        averageConversionRate: metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0,
        roas: metrics.spend > 0 ? metrics.conversionValue / metrics.spend : 0,
        costPerConversion: metrics.conversions > 0 ? metrics.spend / metrics.conversions : 0,
        platformBreakdown
      };

      this.logger.log(`Dashboard metrics calculated for user ${userId}`);
      return dashboard;

    } catch (error) {
      this.logger.error(`Error calculating dashboard metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get campaign performance data with trends
   */
  async getCampaignPerformance(
    userId: string,
    filters: AnalyticsFilterDto
  ): Promise<CampaignPerformanceDto[]> {
    try {
      this.logger.log(`Getting campaign performance for user ${userId}`);

      const { startDate, endDate, platforms, campaignIds } = filters;
      const dateRange = this.buildDateRange(startDate, endDate);

      // Get campaigns
      const campaignsQuery = this.campaignRepository.createQueryBuilder('campaign')
        .where('campaign.userId = :userId', { userId })
        .andWhere('campaign.deletedAt IS NULL');

      if (platforms && platforms.length > 0) {
        campaignsQuery.andWhere('campaign.platform IN (:...platforms)', { platforms });
      }

      if (campaignIds && campaignIds.length > 0) {
        campaignsQuery.andWhere('campaign.id IN (:...campaignIds)', { campaignIds });
      }

      const campaigns = await campaignsQuery.getMany();

      // Get metrics for each campaign
      const performance: CampaignPerformanceDto[] = [];

      for (const campaign of campaigns) {
        const metrics = await this.getCampaignMetrics(
          campaign.id,
          dateRange.start,
          dateRange.end
        );

        // Calculate 7-day trend
        const trendStartDate = new Date(dateRange.start);
        trendStartDate.setDate(trendStartDate.getDate() - 7);

        const previousMetrics = await this.getCampaignMetrics(
          campaign.id,
          trendStartDate,
          new Date(dateRange.start.getTime() - 24 * 60 * 60 * 1000) // Day before current period
        );

        const trend = this.calculateTrend(metrics, previousMetrics);

        performance.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          platform: campaign.platform || 'unknown',
          metrics: {
            spend: metrics.spend,
            impressions: metrics.impressions,
            clicks: metrics.clicks,
            ctr: metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0,
            cpc: metrics.clicks > 0 ? metrics.spend / metrics.clicks : 0,
            conversions: metrics.conversions,
            conversionValue: metrics.conversionValue,
            conversionRate: metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0,
            roas: metrics.spend > 0 ? metrics.conversionValue / metrics.spend : 0,
          },
          trend: {
            spendChange: trend.spend.changePercent,
            clicksChange: trend.clicks.changePercent,
            conversionsChange: trend.conversions.changePercent,
            roasChange: trend.roas.changePercent,
          }
        });
      }

      // Sort by spend descending
      performance.sort((a, b) => b.metrics.spend - a.metrics.spend);

      this.logger.log(`Campaign performance calculated for ${performance.length} campaigns`);
      return performance;

    } catch (error) {
      this.logger.error(`Error calculating campaign performance: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get time series data for charts
   */
  async getTimeSeriesData(
    userId: string,
    filters: AnalyticsFilterDto
  ): Promise<TimeSeriesDataDto[]> {
    try {
      this.logger.log(`Getting time series data for user ${userId}`);

      const { startDate, endDate, platforms, campaignIds, groupBy = 'day' } = filters;
      const dateRange = this.buildDateRange(startDate, endDate);

      // Get daily metrics grouped by date
      const query = this.metricsRepository.createQueryBuilder('metrics')
        .select([
          'DATE(metrics.date) as date',
          'SUM(metrics.spend) as spend',
          'SUM(metrics.impressions) as impressions',
          'SUM(metrics.clicks) as clicks',
          'SUM(metrics.conversions) as conversions',
          'SUM(metrics.conversionValue) as conversionValue',
          'metrics.platform as platform'
        ])
        .innerJoin('metrics.campaign', 'campaign')
        .where('campaign.userId = :userId', { userId })
        .andWhere('campaign.deletedAt IS NULL')
        .andWhere('metrics.date BETWEEN :startDate AND :endDate', {
          startDate: dateRange.start,
          endDate: dateRange.end
        });

      if (platforms && platforms.length > 0) {
        query.andWhere('campaign.platform IN (:...platforms)', { platforms });
      }

      if (campaignIds && campaignIds.length > 0) {
        query.andWhere('campaign.id IN (:...campaignIds)', { campaignIds });
      }

      // Group by date and optionally by platform for breakdown
      query.groupBy('DATE(metrics.date)');

      if (groupBy === 'day') {
        query.addGroupBy('metrics.platform');
      }

      query.orderBy('DATE(metrics.date)', 'ASC');

      const rawData = await query.getRawMany();

      // Process and group the data
      const timeSeriesMap = new Map<string, TimeSeriesDataDto>();

      for (const row of rawData) {
        const dateKey = row.date;

        if (!timeSeriesMap.has(dateKey)) {
          timeSeriesMap.set(dateKey, {
            date: dateKey,
            metrics: {
              spend: 0,
              impressions: 0,
              clicks: 0,
              conversions: 0,
              conversionValue: 0,
            },
            platformData: []
          });
        }

        const dayData = timeSeriesMap.get(dateKey)!;

        // Add to total metrics
        dayData.metrics.spend += parseFloat(row.spend) || 0;
        dayData.metrics.impressions += parseInt(row.impressions) || 0;
        dayData.metrics.clicks += parseInt(row.clicks) || 0;
        dayData.metrics.conversions += parseInt(row.conversions) || 0;
        dayData.metrics.conversionValue += parseFloat(row.conversionValue) || 0;

        // Add platform breakdown
        dayData.platformData!.push({
          platform: row.platform,
          spend: parseFloat(row.spend) || 0,
          clicks: parseInt(row.clicks) || 0,
          conversions: parseInt(row.conversions) || 0,
        });
      }

      const result = Array.from(timeSeriesMap.values());

      this.logger.log(`Time series data calculated for ${result.length} data points`);
      return result;

    } catch (error) {
      this.logger.error(`Error calculating time series data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Compare performance between platforms
   */
  async comparePlatforms(
    userId: string,
    filters: AnalyticsFilterDto
  ): Promise<PlatformMetrics[]> {
    try {
      this.logger.log(`Comparing platform performance for user ${userId}`);

      const { startDate, endDate, campaignIds } = filters;
      const dateRange = this.buildDateRange(startDate, endDate);

      const query = this.metricsRepository.createQueryBuilder('metrics')
        .select([
          'campaign.platform as platform',
          'SUM(metrics.spend) as spend',
          'SUM(metrics.impressions) as impressions',
          'SUM(metrics.clicks) as clicks',
          'SUM(metrics.conversions) as conversions',
          'SUM(metrics.conversionValue) as conversionValue'
        ])
        .innerJoin('metrics.campaign', 'campaign')
        .where('campaign.userId = :userId', { userId })
        .andWhere('campaign.deletedAt IS NULL')
        .andWhere('metrics.date BETWEEN :startDate AND :endDate', {
          startDate: dateRange.start,
          endDate: dateRange.end
        });

      if (campaignIds && campaignIds.length > 0) {
        query.andWhere('campaign.id IN (:...campaignIds)', { campaignIds });
      }

      query.groupBy('campaign.platform')
        .orderBy('SUM(metrics.spend)', 'DESC');

      const rawData = await query.getRawMany();

      const platformMetrics: PlatformMetrics[] = rawData.map(row => {
        const spend = parseFloat(row.spend) || 0;
        const impressions = parseInt(row.impressions) || 0;
        const clicks = parseInt(row.clicks) || 0;
        const conversions = parseInt(row.conversions) || 0;
        const conversionValue = parseFloat(row.conversionValue) || 0;

        return {
          platform: row.platform,
          spend,
          impressions,
          clicks,
          conversions,
          conversionValue,
          ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
          cpc: clicks > 0 ? spend / clicks : 0,
          roas: spend > 0 ? conversionValue / spend : 0,
        };
      });

      this.logger.log(`Platform comparison calculated for ${platformMetrics.length} platforms`);
      return platformMetrics;

    } catch (error) {
      this.logger.error(`Error comparing platforms: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private buildDateRange(startDate?: string, endDate?: string) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago

    return { start, end };
  }

  private async getAggregatedMetrics(
    userId: string,
    startDate: Date,
    endDate: Date,
    platforms?: CampaignPlatform[],
    campaignIds?: string[]
  ) {
    const query = this.metricsRepository.createQueryBuilder('metrics')
      .select([
        'SUM(metrics.spend) as spend',
        'SUM(metrics.impressions) as impressions',
        'SUM(metrics.clicks) as clicks',
        'SUM(metrics.conversions) as conversions',
        'SUM(metrics.conversionValue) as conversionValue'
      ])
      .innerJoin('metrics.campaign', 'campaign')
      .where('campaign.userId = :userId', { userId })
      .andWhere('campaign.deletedAt IS NULL')
      .andWhere('metrics.date BETWEEN :startDate AND :endDate', { startDate, endDate });

    if (platforms && platforms.length > 0) {
      query.andWhere('campaign.platform IN (:...platforms)', { platforms });
    }

    if (campaignIds && campaignIds.length > 0) {
      query.andWhere('campaign.id IN (:...campaignIds)', { campaignIds });
    }

    const result = await query.getRawOne();

    return {
      spend: parseFloat(result.spend) || 0,
      impressions: parseInt(result.impressions) || 0,
      clicks: parseInt(result.clicks) || 0,
      conversions: parseInt(result.conversions) || 0,
      conversionValue: parseFloat(result.conversionValue) || 0,
    };
  }

  private async getPlatformBreakdown(
    userId: string,
    startDate: Date,
    endDate: Date,
    platforms?: CampaignPlatform[],
    campaignIds?: string[]
  ) {
    const query = this.metricsRepository.createQueryBuilder('metrics')
      .select([
        'campaign.platform as platform',
        'SUM(metrics.spend) as spend',
        'SUM(metrics.conversions) as conversions',
        'SUM(metrics.conversionValue) as conversionValue'
      ])
      .innerJoin('metrics.campaign', 'campaign')
      .where('campaign.userId = :userId', { userId })
      .andWhere('campaign.deletedAt IS NULL')
      .andWhere('metrics.date BETWEEN :startDate AND :endDate', { startDate, endDate });

    if (platforms && platforms.length > 0) {
      query.andWhere('campaign.platform IN (:...platforms)', { platforms });
    }

    if (campaignIds && campaignIds.length > 0) {
      query.andWhere('campaign.id IN (:...campaignIds)', { campaignIds });
    }

    query.groupBy('campaign.platform');

    const rawData = await query.getRawMany();

    return rawData.map(row => {
      const spend = parseFloat(row.spend) || 0;
      const conversions = parseInt(row.conversions) || 0;
      const conversionValue = parseFloat(row.conversionValue) || 0;

      return {
        platform: row.platform,
        spend,
        conversions,
        roas: spend > 0 ? conversionValue / spend : 0,
      };
    });
  }

  private async getCampaignMetrics(campaignId: string, startDate: Date, endDate: Date) {
    const result = await this.metricsRepository.createQueryBuilder('metrics')
      .select([
        'SUM(metrics.spend) as spend',
        'SUM(metrics.impressions) as impressions',
        'SUM(metrics.clicks) as clicks',
        'SUM(metrics.conversions) as conversions',
        'SUM(metrics.conversionValue) as conversionValue'
      ])
      .where('metrics.campaignId = :campaignId', { campaignId })
      .andWhere('metrics.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    return {
      spend: parseFloat(result.spend) || 0,
      impressions: parseInt(result.impressions) || 0,
      clicks: parseInt(result.clicks) || 0,
      conversions: parseInt(result.conversions) || 0,
      conversionValue: parseFloat(result.conversionValue) || 0,
    };
  }

  private calculateTrend(current: any, previous: any): Record<string, TrendData> {
    const calculateChange = (currentVal: number, previousVal: number): TrendData => {
      const change = currentVal - previousVal;
      const changePercent = previousVal > 0 ? (change / previousVal) * 100 : 0;

      return {
        current: currentVal,
        previous: previousVal,
        change,
        changePercent
      };
    };

    return {
      spend: calculateChange(current.spend, previous.spend),
      clicks: calculateChange(current.clicks, previous.clicks),
      conversions: calculateChange(current.conversions, previous.conversions),
      roas: calculateChange(
        current.spend > 0 ? current.conversionValue / current.spend : 0,
        previous.spend > 0 ? previous.conversionValue / previous.spend : 0
      )
    };
  }
}