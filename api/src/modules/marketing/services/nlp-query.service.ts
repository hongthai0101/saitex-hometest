import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsAggregationService } from './analytics-aggregation.service';
import {
  NaturalLanguageQueryDto,
  QueryResponseDto,
  AnalyticsFilterDto
} from '../dto/campaign-analytics.dto';
import { CampaignPlatform } from '../entities/campaign.entity';

interface QueryIntent {
  intent: string;
  confidence: number;
  entities: {
    platforms?: string[];
    metrics?: string[];
    timeRange?: {
      start: string;
      end: string;
    };
    campaigns?: string[];
    comparison?: boolean;
    trend?: boolean;
  };
}

interface MetricMapping {
  [key: string]: string[];
}

@Injectable()
export class NlpQueryService {
  private readonly logger = new Logger(NlpQueryService.name);

  // Mapping of natural language terms to metrics
  private readonly metricMappings: MetricMapping = {
    spend: ['spend', 'cost', 'budget', 'money', 'spent', 'spending'],
    clicks: ['clicks', 'click', 'traffic'],
    impressions: ['impressions', 'views', 'seen', 'shown', 'displays'],
    conversions: ['conversions', 'sales', 'purchases', 'converts', 'converting'],
    ctr: ['ctr', 'click-through rate', 'click rate'],
    cpc: ['cpc', 'cost per click', 'cost-per-click'],
    roas: ['roas', 'return on ad spend', 'roi', 'return'],
    conversionRate: ['conversion rate', 'convert rate', 'purchase rate'],
  };

  // Common intent patterns
  private readonly intentPatterns = [
    {
      pattern: /show.*performance|performance.*show|how.*perform/i,
      intent: 'performance_overview',
      confidence: 0.9
    },
    {
      pattern: /compare.*platform|platform.*compare|facebook.*google|google.*facebook/i,
      intent: 'platform_comparison',
      confidence: 0.95
    },
    {
      pattern: /trend|over time|time series|historical|past|last.*days|last.*weeks|last.*months/i,
      intent: 'trend_analysis',
      confidence: 0.8
    },
    {
      pattern: /best.*campaign|top.*campaign|highest.*campaign|worst.*campaign|lowest.*campaign/i,
      intent: 'campaign_ranking',
      confidence: 0.85
    },
    {
      pattern: /dashboard|overview|summary|total|all/i,
      intent: 'dashboard_overview',
      confidence: 0.7
    },
    {
      pattern: /spend.*much|cost.*much|budget|money/i,
      intent: 'spend_analysis',
      confidence: 0.8
    },
  ];

  // Platform keywords
  private readonly platformKeywords = {
    [CampaignPlatform.GOOGLE_ADS]: ['google', 'google ads', 'adwords', 'search'],
    [CampaignPlatform.FACEBOOK_ADS]: ['facebook', 'fb', 'meta', 'instagram', 'social'],
  };

  // Time period patterns
  private readonly timePeriodPatterns = [
    { pattern: /yesterday/i, days: 1 },
    { pattern: /last week|past week/i, days: 7 },
    { pattern: /last month|past month/i, days: 30 },
    { pattern: /last (\d+) days?/i, extractor: (match: RegExpMatchArray) => parseInt(match[1]) },
    { pattern: /last (\d+) weeks?/i, extractor: (match: RegExpMatchArray) => parseInt(match[1]) * 7 },
    { pattern: /last (\d+) months?/i, extractor: (match: RegExpMatchArray) => parseInt(match[1]) * 30 },
    { pattern: /this week/i, days: 7, fromToday: true },
    { pattern: /this month/i, days: 30, fromToday: true },
  ];

  constructor(
    private readonly analyticsService: AnalyticsAggregationService,
  ) {}

  /**
   * Process natural language query and return structured response
   */
  async processQuery(
    userId: string,
    queryDto: NaturalLanguageQueryDto
  ): Promise<QueryResponseDto> {
    try {
      this.logger.log(`Processing NLP query for user ${userId}: "${queryDto.query}"`);

      // Parse the query to extract intent and entities
      const interpretation = this.parseQuery(queryDto.query, queryDto.context);

      // Build analytics filter from interpretation
      const filters = this.buildAnalyticsFilter(interpretation);

      // Execute the appropriate analytics query based on intent
      const data = await this.executeQuery(userId, interpretation, filters);

      // Generate natural language response
      const response = this.generateResponse(interpretation, data);

      // Generate follow-up suggestions
      const suggestions = this.generateSuggestions(interpretation);

      const result: QueryResponseDto = {
        interpretation: {
          intent: interpretation.intent,
          entities: interpretation.entities,
        },
        data,
        suggestions,
        response,
      };

      this.logger.log(`NLP query processed successfully for user ${userId}`);
      return result;

    } catch (error) {
      this.logger.error(`Error processing NLP query: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Parse natural language query to extract intent and entities
   */
  private parseQuery(query: string, context?: any): QueryIntent {
    const queryLower = query.toLowerCase();

    // Detect intent
    let intent = 'general_query';
    let confidence = 0.5;

    for (const pattern of this.intentPatterns) {
      if (pattern.pattern.test(query)) {
        intent = pattern.intent;
        confidence = pattern.confidence;
        break;
      }
    }

    // Extract platforms
    const platforms: string[] = [];
    for (const [platform, keywords] of Object.entries(this.platformKeywords)) {
      for (const keyword of keywords) {
        if (queryLower.includes(keyword)) {
          platforms.push(platform);
          break;
        }
      }
    }

    // Extract metrics
    const metrics: string[] = [];
    for (const [metric, keywords] of Object.entries(this.metricMappings)) {
      for (const keyword of keywords) {
        if (queryLower.includes(keyword)) {
          metrics.push(metric);
        }
      }
    }

    // Extract time range
    const timeRange = this.extractTimeRange(query, context);

    // Detect comparison intent
    const comparison = /compare|vs|versus|between/.test(queryLower);

    // Detect trend intent
    const trend = /trend|over time|change|increase|decrease|growth/.test(queryLower);

    return {
      intent,
      confidence,
      entities: {
        platforms: platforms.length > 0 ? platforms : undefined,
        metrics: metrics.length > 0 ? metrics : undefined,
        timeRange,
        comparison,
        trend,
      },
    };
  }

  /**
   * Extract time range from query
   */
  private extractTimeRange(query: string, context?: any): { start: string; end: string } | undefined {
    // Check if context provides time range
    if (context?.dateRange) {
      return {
        start: context.dateRange.start,
        end: context.dateRange.end,
      };
    }

    // Extract from natural language
    for (const pattern of this.timePeriodPatterns) {
      const match = query.match(pattern.pattern);
      if (match) {
        const days = pattern.extractor ? pattern.extractor(match) : pattern.days;
        const endDate = new Date();
        const startDate = new Date();

        if (pattern.fromToday) {
          // For "this week", "this month" - from beginning of period to today
          if (days === 7) {
            startDate.setDate(endDate.getDate() - endDate.getDay()); // Start of week
          } else if (days === 30) {
            startDate.setDate(1); // Start of month
          }
        } else {
          // For "last X days/weeks/months"
          startDate.setDate(endDate.getDate() - days);
        }

        return {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        };
      }
    }

    // Default to last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  }

  /**
   * Build analytics filter from query interpretation
   */
  private buildAnalyticsFilter(interpretation: QueryIntent): AnalyticsFilterDto {
    const filter: AnalyticsFilterDto = {};

    if (interpretation.entities.timeRange) {
      filter.startDate = interpretation.entities.timeRange.start;
      filter.endDate = interpretation.entities.timeRange.end;
    }

    if (interpretation.entities.platforms) {
      filter.platforms = interpretation.entities.platforms as CampaignPlatform[];
    }

    return filter;
  }

  /**
   * Execute analytics query based on intent
   */
  private async executeQuery(
    userId: string,
    interpretation: QueryIntent,
    filters: AnalyticsFilterDto
  ): Promise<any> {
    switch (interpretation.intent) {
      case 'dashboard_overview':
        return this.analyticsService.getDashboardMetrics(userId, filters);

      case 'performance_overview':
        return this.analyticsService.getCampaignPerformance(userId, filters);

      case 'platform_comparison':
        return this.analyticsService.comparePlatforms(userId, filters);

      case 'trend_analysis':
        return this.analyticsService.getTimeSeriesData(userId, {
          ...filters,
          groupBy: 'day',
        });

      case 'campaign_ranking':
        const campaigns = await this.analyticsService.getCampaignPerformance(userId, filters);
        // Sort by spend or ROAS depending on query context
        return campaigns.sort((a, b) => b.metrics.spend - a.metrics.spend);

      case 'spend_analysis':
        const spendData = await this.analyticsService.getDashboardMetrics(userId, filters);
        return {
          totalSpend: spendData.totalSpend,
          platformBreakdown: spendData.platformBreakdown,
          averageCpc: spendData.averageCpc,
        };

      default:
        return this.analyticsService.getDashboardMetrics(userId, filters);
    }
  }

  /**
   * Generate natural language response
   */
  private generateResponse(interpretation: QueryIntent, data: any): string {
    const entities = interpretation.entities;
    const platformText = entities.platforms
      ? entities.platforms.join(' and ')
      : 'all platforms';

    const timeText = entities.timeRange
      ? `from ${entities.timeRange.start} to ${entities.timeRange.end}`
      : 'for the selected period';

    switch (interpretation.intent) {
      case 'dashboard_overview':
        return `Here's your marketing performance overview for ${platformText} ${timeText}. You've spent $${data.totalSpend?.toLocaleString() || 0} total, generated ${data.totalClicks?.toLocaleString() || 0} clicks, and achieved ${data.totalConversions || 0} conversions with a ${data.roas?.toFixed(2) || 0}x ROAS.`;

      case 'platform_comparison':
        const topPlatform = data?.[0]?.platform || 'N/A';
        return `Comparing your platform performance ${timeText}. ${topPlatform} is your top-performing platform by spend. The data shows performance metrics across all your connected advertising platforms.`;

      case 'trend_analysis':
        return `Here's your trend analysis ${timeText}. The time series data shows how your key metrics have changed over time across ${platformText}.`;

      case 'campaign_ranking':
        const topCampaign = data?.[0]?.campaignName || 'N/A';
        return `Your campaign performance ranking ${timeText}. "${topCampaign}" is currently your top-performing campaign by spend across ${platformText}.`;

      case 'spend_analysis':
        return `Your spend analysis ${timeText}: Total spend is $${data.totalSpend?.toLocaleString() || 0} with an average CPC of $${data.averageCpc?.toFixed(2) || 0} across ${platformText}.`;

      default:
        return `Here's your marketing data for ${platformText} ${timeText}. The analytics show your campaign performance across the requested metrics.`;
    }
  }

  /**
   * Generate follow-up suggestions
   */
  private generateSuggestions(interpretation: QueryIntent): string[] {
    const baseSuggestions = [
      'Show me my best performing campaigns',
      'Compare Facebook and Google Ads performance',
      'How much did I spend last month?',
      'Show me conversion trends over the last 30 days',
    ];

    const intentSpecificSuggestions: Record<string, string[]> = {
      dashboard_overview: [
        'Which platform has the highest ROAS?',
        'Show me my campaign performance breakdown',
        'How did my metrics change compared to last week?',
      ],
      platform_comparison: [
        'Which campaigns are underperforming?',
        'Show me cost per conversion by platform',
        'What\'s my click-through rate trend?',
      ],
      trend_analysis: [
        'Which campaigns show the best growth?',
        'Compare this month to last month',
        'Show me my worst performing days',
      ],
      campaign_ranking: [
        'Why is my top campaign performing well?',
        'Show me underperforming campaigns',
        'What\'s the average ROAS across all campaigns?',
      ],
    };

    const specific = intentSpecificSuggestions[interpretation.intent] || [];
    return [...specific.slice(0, 2), ...baseSuggestions.slice(0, 2)];
  }
}