import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from '../services/analytics.service';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';
import {
  SummaryMetricsDto,
  RevenueTrendDto,
  CustomerGrowthDto,
} from '../dto/analytics-response.dto';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Get summary metrics',
    description: 'Get total revenue, customers, orders, and products with growth rates',
  })
  @ApiResponse({
    status: 200,
    description: 'Summary metrics retrieved successfully',
    type: SummaryMetricsDto,
  })
  async getSummaryMetrics(@Query() query: AnalyticsQueryDto): Promise<SummaryMetricsDto> {
    return this.analyticsService.getSummaryMetrics(query.startDate, query.endDate);
  }

  @Get('revenue-trend')
  @ApiOperation({
    summary: 'Get revenue trend',
    description: 'Get revenue trend data for charts grouped by month',
  })
  @ApiResponse({
    status: 200,
    description: 'Revenue trend data retrieved successfully',
    type: RevenueTrendDto,
  })
  async getRevenueTrend(@Query() query: AnalyticsQueryDto): Promise<RevenueTrendDto> {
    return this.analyticsService.getRevenueTrend(query.startDate, query.endDate);
  }

  @Get('customer-growth')
  @ApiOperation({
    summary: 'Get customer growth',
    description: 'Get customer growth data for charts grouped by month',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer growth data retrieved successfully',
    type: CustomerGrowthDto,
  })
  async getCustomerGrowth(@Query() query: AnalyticsQueryDto): Promise<CustomerGrowthDto> {
    return this.analyticsService.getCustomerGrowth(query.startDate, query.endDate);
  }
}
