import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnalyticsAggregationService, PlatformMetrics } from '../services/analytics-aggregation.service';
import { GoogleAdsService } from '../services/google-ads.service';
import { FacebookAdsService } from '../services/facebook-ads.service';
import { NlpQueryService } from '../services/nlp-query.service';
import {
  AnalyticsFilterDto,
  DashboardMetricsDto,
  CampaignPerformanceDto,
  TimeSeriesDataDto,
  NaturalLanguageQueryDto,
  QueryResponseDto,
} from '../dto/campaign-analytics.dto';
import { CampaignPlatform } from '../entities/campaign.entity';

@ApiTags('Marketing Analytics')
@Controller('marketing/analytics')
@ApiBearerAuth()
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsAggregationService,
    private readonly googleAdsService: GoogleAdsService,
    private readonly facebookAdsService: FacebookAdsService,
    private readonly nlpQueryService: NlpQueryService,
  ) {}

  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get dashboard overview metrics',
    description: 'Get aggregated marketing metrics across all platforms for dashboard display'
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard metrics retrieved successfully',
    type: DashboardMetricsDto,
  })
  @ApiQuery({ name: 'startDate', required: false, type: String, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, type: String, example: '2024-01-31' })
  @ApiQuery({ name: 'platforms', required: false, enum: CampaignPlatform, isArray: true })
  @ApiQuery({ name: 'campaignIds', required: false, type: [String] })
  async getDashboardMetrics(
    @Query() filters: AnalyticsFilterDto,
  ): Promise<DashboardMetricsDto> {
    // In a real implementation, get userId from JWT token
    const userId = 'mock-user-id'; // TODO: Extract from auth token

    return this.analyticsService.getDashboardMetrics(userId, filters);
  }

  @Get('campaigns/performance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get campaign performance data',
    description: 'Get detailed performance metrics for individual campaigns with trend analysis'
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign performance data retrieved successfully',
    type: [CampaignPerformanceDto],
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'platforms', required: false, enum: CampaignPlatform, isArray: true })
  @ApiQuery({ name: 'campaignIds', required: false, type: [String] })
  async getCampaignPerformance(
    @Query() filters: AnalyticsFilterDto,
  ): Promise<CampaignPerformanceDto[]> {
    const userId = 'mock-user-id'; // TODO: Extract from auth token

    return this.analyticsService.getCampaignPerformance(userId, filters);
  }

  @Get('time-series')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get time series data for charts',
    description: 'Get metrics data grouped by time periods for visualization charts'
  })
  @ApiResponse({
    status: 200,
    description: 'Time series data retrieved successfully',
    type: [TimeSeriesDataDto],
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'platforms', required: false, enum: CampaignPlatform, isArray: true })
  @ApiQuery({ name: 'campaignIds', required: false, type: [String] })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['day', 'week', 'month'], example: 'day' })
  async getTimeSeriesData(
    @Query() filters: AnalyticsFilterDto,
  ): Promise<TimeSeriesDataDto[]> {
    const userId = 'mock-user-id'; // TODO: Extract from auth token

    return this.analyticsService.getTimeSeriesData(userId, filters);
  }

  @Get('platforms/comparison')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Compare performance between platforms',
    description: 'Get comparative metrics between different marketing platforms'
  })
  @ApiResponse({
    status: 200,
    description: 'Platform comparison data retrieved successfully',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'campaignIds', required: false, type: [String] })
  async comparePlatforms(
    @Query() filters: AnalyticsFilterDto,
  ): Promise<PlatformMetrics[]> {
    const userId = 'mock-user-id'; // TODO: Extract from auth token

    return this.analyticsService.comparePlatforms(userId, filters);
  }

  @Post('query/natural-language')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ask questions about marketing data in natural language',
    description: 'Process natural language queries about marketing performance and return structured results'
  })
  @ApiResponse({
    status: 200,
    description: 'Natural language query processed successfully',
    type: QueryResponseDto,
  })
  async processNaturalLanguageQuery(
    @Body() queryDto: NaturalLanguageQueryDto,
  ): Promise<QueryResponseDto> {
    const userId = 'mock-user-id'; // TODO: Extract from auth token

    return this.nlpQueryService.processQuery(userId, queryDto);
  }

  @Get('sync/google-ads')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync Google Ads data',
    description: 'Trigger synchronization of campaigns and metrics from Google Ads'
  })
  @ApiResponse({
    status: 200,
    description: 'Google Ads sync completed successfully',
  })
  async syncGoogleAds() {
    const userId = 'mock-user-id'; // TODO: Extract from auth token

    // Mock config - in real implementation, get from user settings
    const config = {
      clientId: 'mock-client-id',
      clientSecret: 'mock-client-secret',
      refreshToken: 'mock-refresh-token',
      developerToken: 'mock-developer-token',
      customerId: 'mock-customer-id',
    };

    const campaigns = await this.googleAdsService.syncCampaigns(userId, config);

    // Sync metrics for the last 30 days
    const endDate = new Date();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const metrics = await this.googleAdsService.syncCampaignMetrics(
      userId,
      config,
      startDate,
      endDate
    );

    return {
      campaignsSynced: campaigns.length,
      metricsRecordsSynced: metrics.length,
      syncedAt: new Date().toISOString(),
    };
  }

  @Get('sync/facebook-ads')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync Facebook Ads data',
    description: 'Trigger synchronization of campaigns and metrics from Facebook Ads'
  })
  @ApiResponse({
    status: 200,
    description: 'Facebook Ads sync completed successfully',
  })
  async syncFacebookAds() {
    const userId = 'mock-user-id'; // TODO: Extract from auth token

    // Mock config - in real implementation, get from user settings
    const config = {
      accessToken: 'mock-access-token',
      adAccountId: 'act_mock-account-id',
      appId: 'mock-app-id',
      appSecret: 'mock-app-secret',
    };

    const campaigns = await this.facebookAdsService.syncCampaigns(userId, config);

    // Sync metrics for the last 30 days
    const endDate = new Date();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const metrics = await this.facebookAdsService.syncCampaignMetrics(
      userId,
      config,
      startDate,
      endDate
    );

    return {
      campaignsSynced: campaigns.length,
      metricsRecordsSynced: metrics.length,
      syncedAt: new Date().toISOString(),
    };
  }

  @Get('sync/all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync all platform data',
    description: 'Trigger synchronization of campaigns and metrics from all connected platforms'
  })
  @ApiResponse({
    status: 200,
    description: 'All platforms sync completed successfully',
  })
  async syncAllPlatforms() {
    const userId = 'mock-user-id'; // TODO: Extract from auth token

    // Sync Google Ads
    const googleConfig = {
      clientId: 'mock-client-id',
      clientSecret: 'mock-client-secret',
      refreshToken: 'mock-refresh-token',
      developerToken: 'mock-developer-token',
      customerId: 'mock-customer-id',
    };

    // Sync Facebook Ads
    const facebookConfig = {
      accessToken: 'mock-access-token',
      adAccountId: 'act_mock-account-id',
      appId: 'mock-app-id',
      appSecret: 'mock-app-secret',
    };

    const endDate = new Date();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Run syncs in parallel
    const [googleResults, facebookResults] = await Promise.all([
      Promise.all([
        this.googleAdsService.syncCampaigns(userId, googleConfig),
        this.googleAdsService.syncCampaignMetrics(userId, googleConfig, startDate, endDate)
      ]),
      Promise.all([
        this.facebookAdsService.syncCampaigns(userId, facebookConfig),
        this.facebookAdsService.syncCampaignMetrics(userId, facebookConfig, startDate, endDate)
      ])
    ]);

    return {
      google: {
        campaignsSynced: googleResults[0].length,
        metricsRecordsSynced: googleResults[1].length,
      },
      facebook: {
        campaignsSynced: facebookResults[0].length,
        metricsRecordsSynced: facebookResults[1].length,
      },
      syncedAt: new Date().toISOString(),
    };
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check analytics service health',
    description: 'Check the health and connectivity of all marketing platform integrations'
  })
  @ApiResponse({
    status: 200,
    description: 'Service health status',
  })
  async getHealthStatus() {
    // Mock configs for health checks
    const googleConfig = {
      clientId: 'mock-client-id',
      clientSecret: 'mock-client-secret',
      refreshToken: 'mock-refresh-token',
      developerToken: 'mock-developer-token',
      customerId: 'mock-customer-id',
    };

    const facebookConfig = {
      accessToken: 'mock-access-token',
      adAccountId: 'act_mock-account-id',
      appId: 'mock-app-id',
      appSecret: 'mock-app-secret',
    };

    // Test connections in parallel
    const [googleHealth, facebookHealth] = await Promise.all([
      this.googleAdsService.testConnection(googleConfig).catch(() => false),
      this.facebookAdsService.testConnection(facebookConfig).catch(() => false),
    ]);

    return {
      status: 'healthy',
      platforms: {
        googleAds: {
          connected: googleHealth,
          status: googleHealth ? 'connected' : 'disconnected',
        },
        facebookAds: {
          connected: facebookHealth,
          status: facebookHealth ? 'connected' : 'disconnected',
        },
      },
      checkedAt: new Date().toISOString(),
    };
  }
}