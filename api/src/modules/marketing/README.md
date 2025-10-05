# Marketing Analytics Dashboard API

A comprehensive NestJS API module for marketing analytics dashboard that enables e-commerce business owners to visualize their cross-platform marketing performance and ask questions about their data in natural language.

## Features

### 🎯 Multi-Platform Integration
- **Google Ads Integration**: Sync campaigns and metrics from Google Ads API
- **Facebook Ads Integration**: Sync campaigns and metrics from Facebook Marketing API
- **Unified Data Model**: Consistent data structure across all platforms

### 📊 Analytics & Reporting
- **Dashboard Overview**: Aggregated metrics across all platforms
- **Campaign Performance**: Detailed performance analysis with trend comparisons
- **Time Series Data**: Historical data for visualization charts
- **Platform Comparison**: Side-by-side platform performance analysis

### 🤖 Natural Language Processing
- **Smart Query Processing**: Ask questions in natural language
- **Intent Recognition**: Understands various query types and metrics
- **Context-Aware Responses**: Provides meaningful insights and suggestions
- **Follow-up Suggestions**: Recommends related queries

### ⏱️ Automated Data Sync
- **Scheduled Jobs**: Automated data synchronization using cron jobs
- **Configurable Intervals**: Different sync frequencies for campaigns vs metrics
- **Health Monitoring**: Platform connectivity monitoring
- **Manual Sync**: On-demand synchronization triggers

## API Endpoints

### Analytics Endpoints

#### GET `/marketing/analytics/dashboard`
Get dashboard overview metrics
- **Query Parameters**: `startDate`, `endDate`, `platforms[]`, `campaignIds[]`
- **Response**: Aggregated metrics (spend, impressions, clicks, conversions, ROAS, etc.)

#### GET `/marketing/analytics/campaigns/performance`
Get detailed campaign performance with trends
- **Query Parameters**: `startDate`, `endDate`, `platforms[]`, `campaignIds[]`
- **Response**: Array of campaign performance data with 7-day trend analysis

#### GET `/marketing/analytics/time-series`
Get time series data for charts
- **Query Parameters**: `startDate`, `endDate`, `platforms[]`, `campaignIds[]`, `groupBy`
- **Response**: Time-series data points for visualization

#### GET `/marketing/analytics/platforms/comparison`
Compare performance between platforms
- **Query Parameters**: `startDate`, `endDate`, `campaignIds[]`
- **Response**: Platform comparison metrics

#### POST `/marketing/analytics/query/natural-language`
Process natural language queries
- **Body**: `{ query: string, context?: object }`
- **Response**: Structured query response with data and suggestions

### Sync Endpoints

#### GET `/marketing/analytics/sync/google-ads`
Trigger Google Ads data synchronization

#### GET `/marketing/analytics/sync/facebook-ads`
Trigger Facebook Ads data synchronization

#### GET `/marketing/analytics/sync/all`
Trigger synchronization for all platforms

#### GET `/marketing/analytics/health`
Check platform connectivity and health status

## Data Models

### Campaign Entity
```typescript
interface Campaign {
  id: string;
  externalId: string;        // Platform-specific campaign ID
  name: string;
  platform: CampaignPlatform; // GOOGLE_ADS | FACEBOOK_ADS
  status: CampaignStatus;    // ACTIVE | PAUSED | ENDED | DRAFT
  objective: CampaignObjective;
  budget: number;
  dailyBudget: number;
  startDate: Date;
  endDate?: Date;
  userId: string;
  platformSpecificData: object; // Platform-specific campaign data
}
```

### Campaign Metrics Entity
```typescript
interface CampaignMetrics {
  id: string;
  campaignId: string;
  date: Date;
  platform: string;

  // Core metrics
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  conversionValue: number;

  // Calculated metrics
  ctr: number;              // Click-through rate
  cpc: number;              // Cost per click
  cpm: number;              // Cost per mille
  conversionRate: number;   // Conversion rate
  costPerConversion: number;
  roas: number;             // Return on ad spend

  // Engagement metrics
  videoViews: number;
  likes: number;
  shares: number;
  comments: number;
  saves: number;

  // Platform-specific metrics
  platformSpecificMetrics: object;
}
```

## Natural Language Query Examples

The NLP processor can understand various types of queries:

### Performance Overview
- "Show me my marketing performance"
- "How are my campaigns performing?"
- "What's my overall performance this month?"

### Platform Comparison
- "Compare Facebook and Google Ads performance"
- "Which platform has better ROAS?"
- "Show me platform breakdown"

### Trend Analysis
- "Show me trends over the last 30 days"
- "How did my metrics change last week?"
- "What's my spend trend this month?"

### Campaign Ranking
- "Which are my best performing campaigns?"
- "Show me top campaigns by ROAS"
- "What are my worst performing campaigns?"

### Spend Analysis
- "How much did I spend last month?"
- "What's my cost per conversion?"
- "Show me my budget utilization"

## Scheduled Jobs

### Campaign Sync (Hourly)
- Syncs campaign data from all connected platforms
- Updates campaign status, budget, and configuration changes
- Runs every hour to catch real-time campaign updates

### Metrics Sync (Every 6 Hours)
- Syncs performance metrics for the last 3 days
- Captures click, impression, and conversion data
- Ensures data completeness and accuracy

### Historical Data Sync (Daily at 2 AM)
- Complete sync of previous day's data
- Ensures accurate daily reporting
- Handles any delayed data from platforms

### Health Check (Every 30 Minutes)
- Tests platform API connectivity
- Monitors authentication status
- Logs connectivity issues

## Setup Instructions

### 1. Install Dependencies
```bash
pnpm add @nestjs/schedule
```

### 2. Environment Variables
```env
# Google Ads API
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token

# Facebook Marketing API
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
```

### 3. Database Migration
```bash
pnpm run typeorm migration:generate -- -n CreateMarketingTables
pnpm run typeorm migration:run
```

### 4. Module Integration
Add the MarketingModule to your AppModule:

```typescript
import { MarketingModule } from './modules/marketing/marketing.module';

@Module({
  imports: [
    // ... other modules
    MarketingModule,
  ],
})
export class AppModule {}
```

## Architecture

### Service Layer
- **GoogleAdsService**: Handles Google Ads API integration
- **FacebookAdsService**: Handles Facebook Marketing API integration
- **AnalyticsAggregationService**: Aggregates data across platforms
- **NlpQueryService**: Processes natural language queries
- **SyncSchedulerService**: Manages automated data synchronization

### Data Flow
1. **Platform APIs** → **Platform Services** → **Database**
2. **Database** → **Analytics Service** → **API Endpoints**
3. **Natural Language Query** → **NLP Service** → **Analytics Service** → **Response**

### Key Features
- **Cross-platform data normalization**
- **Real-time and historical analytics**
- **Intelligent query processing**
- **Automated data synchronization**
- **Comprehensive error handling**
- **Scalable architecture**

## Usage Examples

### Dashboard Data
```typescript
// Get last 30 days dashboard data
const dashboard = await fetch('/marketing/analytics/dashboard?startDate=2024-01-01&endDate=2024-01-31');

// Platform-specific data
const facebookData = await fetch('/marketing/analytics/dashboard?platforms[]=FACEBOOK_ADS');
```

### Natural Language Queries
```typescript
// Ask about performance
const response = await fetch('/marketing/analytics/query/natural-language', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "How much did I spend on Facebook ads last week?",
    context: {
      dateRange: { start: "2024-01-15", end: "2024-01-21" }
    }
  })
});

// Response includes:
// - interpretation: parsed intent and entities
// - data: relevant analytics data
// - response: natural language explanation
// - suggestions: follow-up questions
```

## Platform-Specific Notes

### Google Ads Integration
- Uses Google Ads API v14
- Requires OAuth 2.0 authentication
- Supports campaign and metrics synchronization
- Handles micro-currency conversion automatically

### Facebook Ads Integration
- Uses Facebook Marketing API v18
- Requires Facebook App and access tokens
- Supports detailed engagement metrics
- Includes Instagram ad data automatically

## Error Handling

- Comprehensive error logging
- Graceful API failure handling
- Retry mechanisms for transient failures
- Platform-specific error codes
- User-friendly error messages

## Performance Considerations

- Database indexing on frequently queried fields
- Efficient aggregation queries
- Pagination for large datasets
- Caching for dashboard metrics
- Background job processing for sync operations

## Future Enhancements

- Additional platform integrations (LinkedIn, Twitter, TikTok)
- Advanced ML-based insights and recommendations
- Real-time alerts and notifications
- Custom dashboard builder
- Advanced natural language understanding
- Data export capabilities
- Multi-user account management