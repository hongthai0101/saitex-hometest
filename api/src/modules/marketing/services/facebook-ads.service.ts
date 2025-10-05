import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketingCampaign, CampaignPlatform, CampaignStatus, CampaignObjective } from '../entities/campaign.entity';
import { CampaignMetrics } from '../entities/campaign-metrics.entity';

interface FacebookAdsConfig {
  accessToken: string;
  adAccountId: string;
  appId: string;
  appSecret: string;
}

interface FacebookCampaignData {
  id: string;
  name: string;
  status: string;
  objective: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  startTime?: string;
  stopTime?: string;
  targeting?: any;
  creative?: any;
  bidStrategy?: string;
}

interface FacebookMetricsData {
  campaignId: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  reach: number;
  frequency: number;
  cpm: number;
  cpc: number;
  ctr: number;
  actions: Array<{
    actionType: string;
    value: number;
  }>;
  actionValues: Array<{
    actionType: string;
    value: number;
  }>;
  videoViews?: number;
  video25PercentWatchedActions?: number;
  video50PercentWatchedActions?: number;
  video75PercentWatchedActions?: number;
  video100PercentWatchedActions?: number;
  linkClicks?: number;
  postEngagement?: number;
  pageLikes?: number;
  postShares?: number;
  postComments?: number;
  postReactions?: number;
  relevanceScore?: number;
  qualityRanking?: string;
  engagementRateRanking?: string;
  conversionRateRanking?: string;
}

@Injectable()
export class FacebookAdsService {
  private readonly logger = new Logger(FacebookAdsService.name);

  constructor(
    @InjectRepository(MarketingCampaign)
    private readonly campaignRepository: Repository<MarketingCampaign>,
    @InjectRepository(CampaignMetrics)
    private readonly metricsRepository: Repository<CampaignMetrics>,
  ) {}

  /**
   * Sync campaigns from Facebook Ads API
   */
  async syncCampaigns(userId: string, config: FacebookAdsConfig): Promise<MarketingCampaign[]> {
    try {
      this.logger.log(`Syncing Facebook Ads campaigns for user ${userId}`);

      // Simulate Facebook Ads API call
      const facebookCampaigns = await this.fetchFacebookCampaigns(config);

      const campaigns: MarketingCampaign[] = [];

      for (const fbCampaign of facebookCampaigns) {
        // Check if campaign already exists
        let campaign = await this.campaignRepository.findOne({
          where: {
            externalId: fbCampaign.id,
            platform: CampaignPlatform.FACEBOOK_ADS,
            userId
          }
        });

        const budget = fbCampaign.lifetimeBudget || fbCampaign.dailyBudget || 0;
        const dailyBudget = fbCampaign.dailyBudget || 0;

        if (!campaign) {
          // Create new campaign
          campaign = this.campaignRepository.create({
            externalId: fbCampaign.id,
            name: fbCampaign.name,
            platform: CampaignPlatform.FACEBOOK_ADS,
            status: this.mapFacebookStatus(fbCampaign.status),
            objective: this.mapFacebookObjective(fbCampaign.objective),
            budget: budget / 100, // Facebook returns cents
            dailyBudget: dailyBudget / 100,
            startDate: fbCampaign.startTime ? new Date(fbCampaign.startTime) : new Date(),
            endDate: fbCampaign.stopTime ? new Date(fbCampaign.stopTime) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            userId,
            targeting: fbCampaign.targeting,
            creativeAssets: fbCampaign.creative,
            platformSpecificData: {
              objective: fbCampaign.objective,
              bidStrategy: fbCampaign.bidStrategy,
              targeting: fbCampaign.targeting,
            },
          });
        } else {
          // Update existing campaign
          campaign.name = fbCampaign.name;
          campaign.status = this.mapFacebookStatus(fbCampaign.status);
          campaign.budget = budget / 100;
          campaign.dailyBudget = dailyBudget / 100;
          campaign.targeting = fbCampaign.targeting;
          campaign.creativeAssets = fbCampaign.creative;
          campaign.platformSpecificData = {
            ...campaign.platformSpecificData,
            objective: fbCampaign.objective,
            bidStrategy: fbCampaign.bidStrategy,
            targeting: fbCampaign.targeting,
          };
        }

        campaign = await this.campaignRepository.save(campaign);
        campaigns.push(campaign);
      }

      this.logger.log(`Synced ${campaigns.length} Facebook Ads campaigns`);
      return campaigns;

    } catch (error) {
      this.logger.error(`Error syncing Facebook Ads campaigns: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Sync campaign metrics from Facebook Ads API
   */
  async syncCampaignMetrics(
    userId: string,
    config: FacebookAdsConfig,
    startDate: Date,
    endDate: Date
  ): Promise<CampaignMetrics[]> {
    try {
      this.logger.log(`Syncing Facebook Ads metrics for user ${userId} from ${startDate} to ${endDate}`);

      // Get user's Facebook Ads campaigns
      const campaigns = await this.campaignRepository.find({
        where: {
          userId,
          platform: CampaignPlatform.FACEBOOK_ADS
        }
      });

      if (campaigns.length === 0) {
        this.logger.warn('No Facebook Ads campaigns found for user');
        return [];
      }

      const campaignIds = campaigns.map(c => c.externalId).filter((id): id is string => id !== undefined);

      // Fetch metrics from Facebook Ads API
      const facebookMetrics = await this.fetchFacebookMetrics(config, campaignIds, startDate, endDate);

      const metrics: CampaignMetrics[] = [];

      for (const fbMetrics of facebookMetrics) {
        const campaign = campaigns.find(c => c.externalId === fbMetrics.campaignId);
        if (!campaign) continue;

        // Check if metrics already exist for this date
        let campaignMetrics = await this.metricsRepository.findOne({
          where: {
            campaignId: campaign.id,
            date: new Date(fbMetrics.date),
          }
        });

        if (!campaignMetrics) {
          campaignMetrics = this.metricsRepository.create({
            campaignId: campaign.id,
            date: new Date(fbMetrics.date),
            platform: CampaignPlatform.FACEBOOK_ADS,
          });
        }

        // Update basic metrics
        campaignMetrics.impressions = fbMetrics.impressions;
        campaignMetrics.clicks = fbMetrics.clicks;
        campaignMetrics.spend = fbMetrics.spend / 100; // Facebook returns cents
        campaignMetrics.reach = fbMetrics.reach;
        campaignMetrics.frequency = fbMetrics.frequency;
        campaignMetrics.ctr = fbMetrics.ctr;
        campaignMetrics.cpc = fbMetrics.cpc / 100;
        campaignMetrics.cpm = fbMetrics.cpm / 100;

        // Process actions (conversions)
        const purchases = fbMetrics.actions?.find(a => a.actionType === 'offsite_conversion.fb_pixel_purchase');
        const leadGeneration = fbMetrics.actions?.find(a => a.actionType === 'offsite_conversion.fb_pixel_lead');
        const pageViews = fbMetrics.actions?.find(a => a.actionType === 'offsite_conversion.fb_pixel_view_content');

        campaignMetrics.conversions = (purchases?.value || 0) + (leadGeneration?.value || 0);

        // Process action values (conversion value)
        const purchaseValues = fbMetrics.actionValues?.find(a => a.actionType === 'offsite_conversion.fb_pixel_purchase');
        campaignMetrics.conversionValue = (purchaseValues?.value || 0) / 100;

        // Calculate derived metrics
        campaignMetrics.conversionRate = fbMetrics.clicks > 0 ? (campaignMetrics.conversions / fbMetrics.clicks) * 100 : 0;
        campaignMetrics.costPerConversion = campaignMetrics.conversions > 0 ? campaignMetrics.spend / campaignMetrics.conversions : 0;
        campaignMetrics.roas = campaignMetrics.spend > 0 ? campaignMetrics.conversionValue / campaignMetrics.spend : 0;

        // Engagement metrics
        campaignMetrics.videoViews = fbMetrics.videoViews || 0;
        campaignMetrics.likes = fbMetrics.postReactions || 0;
        campaignMetrics.shares = fbMetrics.postShares || 0;
        campaignMetrics.comments = fbMetrics.postComments || 0;

        // Store Facebook-specific metrics
        campaignMetrics.platformSpecificMetrics = {
          linkClicks: fbMetrics.linkClicks,
          postEngagement: fbMetrics.postEngagement,
          pageLikes: fbMetrics.pageLikes,
          video25PercentWatched: fbMetrics.video25PercentWatchedActions,
          video50PercentWatched: fbMetrics.video50PercentWatchedActions,
          video75PercentWatched: fbMetrics.video75PercentWatchedActions,
          video100PercentWatched: fbMetrics.video100PercentWatchedActions,
          relevanceScore: fbMetrics.relevanceScore,
          qualityRanking: fbMetrics.qualityRanking,
          engagementRateRanking: fbMetrics.engagementRateRanking,
          conversionRateRanking: fbMetrics.conversionRateRanking,
          actions: fbMetrics.actions,
          actionValues: fbMetrics.actionValues,
        };

        campaignMetrics = await this.metricsRepository.save(campaignMetrics);
        metrics.push(campaignMetrics);
      }

      this.logger.log(`Synced ${metrics.length} Facebook Ads metrics records`);
      return metrics;

    } catch (error) {
      this.logger.error(`Error syncing Facebook Ads metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mock Facebook Ads API call to fetch campaigns
   */
  private async fetchFacebookCampaigns(config: FacebookAdsConfig): Promise<FacebookCampaignData[]> {
    // In a real implementation, this would call the Facebook Marketing API
    // For now, return mock data

    return [
      {
        id: 'fb_campaign_1',
        name: 'Facebook Feed - Holiday Collection',
        status: 'ACTIVE',
        objective: 'CONVERSIONS',
        dailyBudget: 5000, // in cents
        startTime: '2024-01-01T00:00:00+0000',
        stopTime: '2024-12-31T23:59:59+0000',
        targeting: {
          demographics: {
            age_min: 25,
            age_max: 55,
            genders: [1, 2], // all genders
          },
          interests: ['Fashion', 'Online shopping', 'Luxury goods'],
          behaviors: ['Frequent online shoppers'],
          locations: {
            countries: ['US', 'CA', 'GB'],
          },
        },
        creative: {
          images: ['https://example.com/creative1.jpg'],
          headlines: ['Discover Our Holiday Collection'],
          descriptions: ['Limited time offers on premium fashion'],
        },
        bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
      },
      {
        id: 'fb_campaign_2',
        name: 'Instagram Stories - Brand Awareness',
        status: 'ACTIVE',
        objective: 'BRAND_AWARENESS',
        dailyBudget: 2500,
        startTime: '2024-01-15T00:00:00+0000',
        targeting: {
          demographics: {
            age_min: 18,
            age_max: 34,
            genders: [1, 2],
          },
          interests: ['Instagram', 'Fashion', 'Lifestyle'],
        },
        creative: {
          videos: ['https://example.com/video1.mp4'],
          headlines: ['Style That Speaks'],
          descriptions: ['Follow your passion for fashion'],
        },
        bidStrategy: 'LOWEST_COST_WITH_BID_CAP',
      },
    ];
  }

  /**
   * Mock Facebook Ads API call to fetch metrics
   */
  private async fetchFacebookMetrics(
    config: FacebookAdsConfig,
    campaignIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<FacebookMetricsData[]> {
    // In a real implementation, this would call the Facebook Marketing API
    // For now, return mock data

    const metrics: FacebookMetricsData[] = [];
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    for (const campaignId of campaignIds) {
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        const impressions = Math.floor(Math.random() * 50000) + 5000;
        const clicks = Math.floor(Math.random() * 1000) + 100;
        const spend = Math.floor(Math.random() * 10000) + 1000; // in cents
        const reach = Math.floor(impressions * (0.7 + Math.random() * 0.3));

        metrics.push({
          campaignId,
          date: date.toISOString().split('T')[0],
          impressions,
          clicks,
          spend,
          reach,
          frequency: impressions / reach,
          cpm: (spend / impressions) * 1000,
          cpc: spend / clicks,
          ctr: (clicks / impressions) * 100,
          actions: [
            { actionType: 'offsite_conversion.fb_pixel_purchase', value: Math.floor(Math.random() * 10) + 1 },
            { actionType: 'offsite_conversion.fb_pixel_lead', value: Math.floor(Math.random() * 5) },
            { actionType: 'offsite_conversion.fb_pixel_view_content', value: Math.floor(Math.random() * 50) + 10 },
            { actionType: 'link_click', value: Math.floor(clicks * 0.8) },
          ],
          actionValues: [
            { actionType: 'offsite_conversion.fb_pixel_purchase', value: Math.floor(Math.random() * 50000) + 10000 }, // in cents
          ],
          videoViews: Math.floor(Math.random() * 500) + 50,
          video25PercentWatchedActions: Math.floor(Math.random() * 400) + 40,
          video50PercentWatchedActions: Math.floor(Math.random() * 300) + 30,
          video75PercentWatchedActions: Math.floor(Math.random() * 200) + 20,
          video100PercentWatchedActions: Math.floor(Math.random() * 100) + 10,
          linkClicks: Math.floor(clicks * 0.8),
          postEngagement: Math.floor(Math.random() * 200) + 20,
          pageLikes: Math.floor(Math.random() * 10) + 1,
          postShares: Math.floor(Math.random() * 15) + 2,
          postComments: Math.floor(Math.random() * 20) + 3,
          postReactions: Math.floor(Math.random() * 100) + 10,
          relevanceScore: Math.floor(Math.random() * 5) + 6,
          qualityRanking: ['ABOVE_AVERAGE', 'AVERAGE', 'BELOW_AVERAGE'][Math.floor(Math.random() * 3)],
          engagementRateRanking: ['ABOVE_AVERAGE', 'AVERAGE', 'BELOW_AVERAGE'][Math.floor(Math.random() * 3)],
          conversionRateRanking: ['ABOVE_AVERAGE', 'AVERAGE', 'BELOW_AVERAGE'][Math.floor(Math.random() * 3)],
        });
      }
    }

    return metrics;
  }

  /**
   * Map Facebook status to our enum
   */
  private mapFacebookStatus(facebookStatus: string): CampaignStatus {
    switch (facebookStatus) {
      case 'ACTIVE':
        return CampaignStatus.ACTIVE;
      case 'PAUSED':
        return CampaignStatus.PAUSED;
      case 'DELETED':
      case 'ARCHIVED':
        return CampaignStatus.ENDED;
      default:
        return CampaignStatus.DRAFT;
    }
  }

  /**
   * Map Facebook objective to our enum
   */
  private mapFacebookObjective(objective: string): CampaignObjective {
    switch (objective) {
      case 'BRAND_AWARENESS':
        return CampaignObjective.BRAND_AWARENESS;
      case 'REACH':
        return CampaignObjective.REACH;
      case 'TRAFFIC':
        return CampaignObjective.TRAFFIC;
      case 'ENGAGEMENT':
        return CampaignObjective.ENGAGEMENT;
      case 'APP_INSTALLS':
        return CampaignObjective.APP_INSTALLS;
      case 'VIDEO_VIEWS':
        return CampaignObjective.VIDEO_VIEWS;
      case 'LEAD_GENERATION':
        return CampaignObjective.LEAD_GENERATION;
      case 'MESSAGES':
        return CampaignObjective.MESSAGES;
      case 'CONVERSIONS':
        return CampaignObjective.CONVERSIONS;
      case 'CATALOG_SALES':
        return CampaignObjective.CATALOG_SALES;
      case 'STORE_TRAFFIC':
        return CampaignObjective.STORE_TRAFFIC;
      default:
        return CampaignObjective.CONVERSIONS;
    }
  }

  /**
   * Test Facebook Ads API connection
   */
  async testConnection(config: FacebookAdsConfig): Promise<boolean> {
    try {
      // In a real implementation, this would test the Facebook Marketing API connection
      // For now, just validate the config
      if (!config.accessToken || !config.adAccountId || !config.appId || !config.appSecret) {
        throw new Error('Missing required Facebook Ads configuration');
      }

      this.logger.log('Facebook Ads connection test successful');
      return true;
    } catch (error) {
      this.logger.error(`Facebook Ads connection test failed: ${error.message}`);
      return false;
    }
  }
}