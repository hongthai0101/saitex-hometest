import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GoogleAdsService } from './google-ads.service';
import { FacebookAdsService } from './facebook-ads.service';

interface PlatformConfig {
  userId: string;
  platform: 'google' | 'facebook';
  config: any;
  enabled: boolean;
}

@Injectable()
export class SyncSchedulerService {
  private readonly logger = new Logger(SyncSchedulerService.name);

  // In a real implementation, these would come from a user settings database
  private readonly platformConfigs: PlatformConfig[] = [
    {
      userId: 'mock-user-id',
      platform: 'google',
      config: {
        clientId: 'mock-client-id',
        clientSecret: 'mock-client-secret',
        refreshToken: 'mock-refresh-token',
        developerToken: 'mock-developer-token',
        customerId: 'mock-customer-id',
      },
      enabled: true,
    },
    {
      userId: 'mock-user-id',
      platform: 'facebook',
      config: {
        accessToken: 'mock-access-token',
        adAccountId: 'act_mock-account-id',
        appId: 'mock-app-id',
        appSecret: 'mock-app-secret',
      },
      enabled: true,
    },
  ];

  constructor(
    private readonly googleAdsService: GoogleAdsService,
    private readonly facebookAdsService: FacebookAdsService,
  ) {}

  /**
   * Sync campaign data every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async syncCampaigns() {
    this.logger.log('Starting scheduled campaign sync');

    try {
      const promises = this.platformConfigs
        .filter(config => config.enabled)
        .map(async (config) => {
          try {
            if (config.platform === 'google') {
              const campaigns = await this.googleAdsService.syncCampaigns(
                config.userId,
                config.config
              );
              this.logger.log(`Synced ${campaigns.length} Google Ads campaigns for user ${config.userId}`);
              return { platform: 'google', userId: config.userId, campaigns: campaigns.length };
            } else if (config.platform === 'facebook') {
              const campaigns = await this.facebookAdsService.syncCampaigns(
                config.userId,
                config.config
              );
              this.logger.log(`Synced ${campaigns.length} Facebook Ads campaigns for user ${config.userId}`);
              return { platform: 'facebook', userId: config.userId, campaigns: campaigns.length };
            }
          } catch (error) {
            this.logger.error(`Error syncing ${config.platform} campaigns for user ${config.userId}:`, error.message);
            return { platform: config.platform, userId: config.userId, error: error.message };
          }
        });

      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.length - successful;

      this.logger.log(`Campaign sync completed: ${successful} successful, ${failed} failed`);

    } catch (error) {
      this.logger.error('Error in scheduled campaign sync:', error.message, error.stack);
    }
  }

  /**
   * Sync metrics data every 6 hours
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async syncMetrics() {
    this.logger.log('Starting scheduled metrics sync');

    try {
      // Sync metrics for the last 3 days to catch any updates
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 3);

      const promises = this.platformConfigs
        .filter(config => config.enabled)
        .map(async (config) => {
          try {
            if (config.platform === 'google') {
              const metrics = await this.googleAdsService.syncCampaignMetrics(
                config.userId,
                config.config,
                startDate,
                endDate
              );
              this.logger.log(`Synced ${metrics.length} Google Ads metrics records for user ${config.userId}`);
              return { platform: 'google', userId: config.userId, metrics: metrics.length };
            } else if (config.platform === 'facebook') {
              const metrics = await this.facebookAdsService.syncCampaignMetrics(
                config.userId,
                config.config,
                startDate,
                endDate
              );
              this.logger.log(`Synced ${metrics.length} Facebook Ads metrics records for user ${config.userId}`);
              return { platform: 'facebook', userId: config.userId, metrics: metrics.length };
            }
          } catch (error) {
            this.logger.error(`Error syncing ${config.platform} metrics for user ${config.userId}:`, error.message);
            return { platform: config.platform, userId: config.userId, error: error.message };
          }
        });

      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.length - successful;

      this.logger.log(`Metrics sync completed: ${successful} successful, ${failed} failed`);

    } catch (error) {
      this.logger.error('Error in scheduled metrics sync:', error.message, error.stack);
    }
  }

  /**
   * Daily historical data sync (runs at 2 AM)
   */
  @Cron('0 2 * * *')
  async syncHistoricalData() {
    this.logger.log('Starting daily historical data sync');

    try {
      // Sync data for yesterday to ensure we have complete daily metrics
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const endDate = new Date(yesterday);
      endDate.setHours(23, 59, 59, 999);

      const promises = this.platformConfigs
        .filter(config => config.enabled)
        .map(async (config) => {
          try {
            let campaignCount = 0;
            let metricsCount = 0;

            if (config.platform === 'google') {
              // Sync campaigns first
              const campaigns = await this.googleAdsService.syncCampaigns(
                config.userId,
                config.config
              );
              campaignCount = campaigns.length;

              // Then sync metrics for yesterday
              const metrics = await this.googleAdsService.syncCampaignMetrics(
                config.userId,
                config.config,
                yesterday,
                endDate
              );
              metricsCount = metrics.length;

              this.logger.log(`Historical sync for user ${config.userId} Google Ads: ${campaignCount} campaigns, ${metricsCount} metrics`);

            } else if (config.platform === 'facebook') {
              // Sync campaigns first
              const campaigns = await this.facebookAdsService.syncCampaigns(
                config.userId,
                config.config
              );
              campaignCount = campaigns.length;

              // Then sync metrics for yesterday
              const metrics = await this.facebookAdsService.syncCampaignMetrics(
                config.userId,
                config.config,
                yesterday,
                endDate
              );
              metricsCount = metrics.length;

              this.logger.log(`Historical sync for user ${config.userId} Facebook Ads: ${campaignCount} campaigns, ${metricsCount} metrics`);
            }

            return {
              platform: config.platform,
              userId: config.userId,
              campaigns: campaignCount,
              metrics: metricsCount
            };

          } catch (error) {
            this.logger.error(`Error in historical sync for ${config.platform} user ${config.userId}:`, error.message);
            return { platform: config.platform, userId: config.userId, error: error.message };
          }
        });

      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.length - successful;

      this.logger.log(`Historical data sync completed: ${successful} successful, ${failed} failed`);

    } catch (error) {
      this.logger.error('Error in daily historical data sync:', error.message, error.stack);
    }
  }

  /**
   * Health check - runs every 30 minutes
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async healthCheck() {
    this.logger.debug('Running platform connectivity health check');

    try {
      const healthChecks = this.platformConfigs
        .filter(config => config.enabled)
        .map(async (config) => {
          try {
            let isHealthy = false;

            if (config.platform === 'google') {
              isHealthy = await this.googleAdsService.testConnection(config.config);
            } else if (config.platform === 'facebook') {
              isHealthy = await this.facebookAdsService.testConnection(config.config);
            }

            return {
              platform: config.platform,
              userId: config.userId,
              healthy: isHealthy,
              checkedAt: new Date().toISOString()
            };

          } catch (error) {
            this.logger.warn(`Health check failed for ${config.platform} user ${config.userId}:`, error.message);
            return {
              platform: config.platform,
              userId: config.userId,
              healthy: false,
              error: error.message,
              checkedAt: new Date().toISOString()
            };
          }
        });

      const results = await Promise.allSettled(healthChecks);
      const healthy = results.filter(result =>
        result.status === 'fulfilled' && (result.value as any).healthy
      ).length;
      const unhealthy = results.length - healthy;

      if (unhealthy > 0) {
        this.logger.warn(`Health check completed: ${healthy} healthy, ${unhealthy} unhealthy platforms`);
      } else {
        this.logger.debug(`Health check completed: all ${healthy} platforms healthy`);
      }

    } catch (error) {
      this.logger.error('Error in platform health check:', error.message, error.stack);
    }
  }

  /**
   * Manual sync trigger for specific user and platform
   */
  async triggerManualSync(
    userId: string,
    platform: 'google' | 'facebook' | 'all',
    syncType: 'campaigns' | 'metrics' | 'both' = 'both'
  ) {
    this.logger.log(`Manual sync triggered for user ${userId}, platform: ${platform}, type: ${syncType}`);

    try {
      const configs = this.platformConfigs.filter(config =>
        config.userId === userId &&
        (platform === 'all' || config.platform === platform) &&
        config.enabled
      );

      if (configs.length === 0) {
        throw new Error(`No enabled platform configs found for user ${userId} and platform ${platform}`);
      }

      const results: any[] = [];

      for (const config of configs) {
        try {
          let campaignResult: any = null;
          let metricsResult: any = null;

          // Sync campaigns if requested
          if (syncType === 'campaigns' || syncType === 'both') {
            if (config.platform === 'google') {
              campaignResult = await this.googleAdsService.syncCampaigns(config.userId, config.config);
            } else if (config.platform === 'facebook') {
              campaignResult = await this.facebookAdsService.syncCampaigns(config.userId, config.config);
            }
          }

          // Sync metrics if requested
          if (syncType === 'metrics' || syncType === 'both') {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 7); // Last 7 days

            if (config.platform === 'google') {
              metricsResult = await this.googleAdsService.syncCampaignMetrics(
                config.userId,
                config.config,
                startDate,
                endDate
              );
            } else if (config.platform === 'facebook') {
              metricsResult = await this.facebookAdsService.syncCampaignMetrics(
                config.userId,
                config.config,
                startDate,
                endDate
              );
            }
          }

          results.push({
            platform: config.platform,
            campaigns: campaignResult?.length || 0,
            metrics: metricsResult?.length || 0,
            success: true
          });

        } catch (error) {
          this.logger.error(`Manual sync failed for ${config.platform}:`, error.message);
          results.push({
            platform: config.platform,
            success: false,
            error: error.message
          });
        }
      }

      this.logger.log(`Manual sync completed for user ${userId}`);
      return results;

    } catch (error) {
      this.logger.error(`Error in manual sync for user ${userId}:`, error.message, error.stack);
      throw error;
    }
  }

  /**
   * Get sync status and statistics
   */
  async getSyncStatus(userId?: string) {
    const configs = userId
      ? this.platformConfigs.filter(config => config.userId === userId)
      : this.platformConfigs;

    return {
      totalConfigs: configs.length,
      enabledConfigs: configs.filter(config => config.enabled).length,
      platforms: [...new Set(configs.map(config => config.platform))],
      users: [...new Set(configs.map(config => config.userId))],
      lastHealthCheck: new Date().toISOString(),
    };
  }
}