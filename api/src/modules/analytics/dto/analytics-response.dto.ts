import { ApiProperty } from '@nestjs/swagger';

export class MetricDto {
  @ApiProperty({ description: 'Current period value' })
  current: number;

  @ApiProperty({ description: 'Previous period value' })
  previous: number;

  @ApiProperty({ description: 'Growth rate percentage', example: '+20.5%' })
  growthRate: string;

  @ApiProperty({ description: 'Is growth positive' })
  isPositive: boolean;
}

export class SummaryMetricsDto {
  @ApiProperty({ type: MetricDto, description: 'Total revenue metrics' })
  totalRevenue: MetricDto;

  @ApiProperty({ type: MetricDto, description: 'Total customers metrics' })
  totalCustomers: MetricDto;

  @ApiProperty({ type: MetricDto, description: 'Total orders metrics' })
  totalOrders: MetricDto;

  @ApiProperty({ type: MetricDto, description: 'Total products metrics' })
  totalProducts: MetricDto;
}

export class ChartDataPointDto {
  @ApiProperty({ description: 'Label for the data point', example: 'Jan' })
  name: string;

  @ApiProperty({ description: 'Value for the data point' })
  value: number;

  @ApiProperty({ description: 'Date for the data point', example: '2024-01-01' })
  date: string;
}

export class RevenueTrendDto {
  @ApiProperty({ type: [ChartDataPointDto], description: 'Revenue trend data points' })
  data: ChartDataPointDto[];

  @ApiProperty({ description: 'Total revenue for the period' })
  total: number;

  @ApiProperty({ description: 'Average revenue per data point' })
  average: number;
}

export class CustomerGrowthDto {
  @ApiProperty({ type: [ChartDataPointDto], description: 'Customer growth data points' })
  data: ChartDataPointDto[];

  @ApiProperty({ description: 'Total new customers for the period' })
  totalNew: number;

  @ApiProperty({ description: 'Growth rate compared to previous period' })
  growthRate: string;
}
