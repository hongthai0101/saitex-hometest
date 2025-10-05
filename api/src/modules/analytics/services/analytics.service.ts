import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Order } from '../../marketing/entities/order.entity';
import { Customer } from '../../marketing/entities/customer.entity';
import { Product } from '../../marketing/entities/product.entity';
import {
  MetricDto,
  SummaryMetricsDto,
  ChartDataPointDto,
  RevenueTrendDto,
  CustomerGrowthDto,
} from '../dto/analytics-response.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  /**
   * Get summary metrics with growth rate
   */
  async getSummaryMetrics(startDate?: string, endDate?: string): Promise<SummaryMetricsDto> {
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Calculate period duration
    const periodDuration = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodDuration);
    const previousEnd = start;

    // Get revenue metrics
    const totalRevenue = await this.getRevenueMetric(start, end, previousStart, previousEnd);

    // Get customer metrics
    const totalCustomers = await this.getCustomerMetric(start, end, previousStart, previousEnd);

    // Get order metrics
    const totalOrders = await this.getOrderMetric(start, end, previousStart, previousEnd);

    // Get product metrics
    const totalProducts = await this.getProductMetric(start, end, previousStart, previousEnd);

    return {
      totalRevenue,
      totalCustomers,
      totalOrders,
      totalProducts,
    };
  }

  /**
   * Get revenue metric with growth rate
   */
  private async getRevenueMetric(
    start: Date,
    end: Date,
    prevStart: Date,
    prevEnd: Date,
  ): Promise<MetricDto> {
    const currentRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere('order.paymentStatus = :status', { status: 'paid' })
      .getRawOne();

    const previousRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.createdAt BETWEEN :start AND :end', { start: prevStart, end: prevEnd })
      .andWhere('order.paymentStatus = :status', { status: 'paid' })
      .getRawOne();

    const current = parseFloat(currentRevenue?.total || '0');
    const previous = parseFloat(previousRevenue?.total || '0');

    return this.calculateGrowthRate(current, previous);
  }

  /**
   * Get customer metric with growth rate
   */
  private async getCustomerMetric(
    start: Date,
    end: Date,
    prevStart: Date,
    prevEnd: Date,
  ): Promise<MetricDto> {
    const currentCount = await this.customerRepository.count({
      where: { createdAt: Between(start, end) },
    });

    const previousCount = await this.customerRepository.count({
      where: { createdAt: Between(prevStart, prevEnd) },
    });

    return this.calculateGrowthRate(currentCount, previousCount);
  }

  /**
   * Get order metric with growth rate
   */
  private async getOrderMetric(
    start: Date,
    end: Date,
    prevStart: Date,
    prevEnd: Date,
  ): Promise<MetricDto> {
    const currentCount = await this.orderRepository.count({
      where: { createdAt: Between(start, end) },
    });

    const previousCount = await this.orderRepository.count({
      where: { createdAt: Between(prevStart, prevEnd) },
    });

    return this.calculateGrowthRate(currentCount, previousCount);
  }

  /**
   * Get product metric with growth rate
   */
  private async getProductMetric(
    start: Date,
    end: Date,
    prevStart: Date,
    prevEnd: Date,
  ): Promise<MetricDto> {
    const currentCount = await this.productRepository.count({
      where: { createdAt: Between(start, end) },
    });

    const previousCount = await this.productRepository.count({
      where: { createdAt: Between(prevStart, prevEnd) },
    });

    return this.calculateGrowthRate(currentCount, previousCount);
  }

  /**
   * Calculate growth rate between two values
   */
  private calculateGrowthRate(current: number, previous: number): MetricDto {
    const growthRate = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    const isPositive = growthRate >= 0;
    const sign = isPositive ? '+' : '';

    return {
      current,
      previous,
      growthRate: `${sign}${growthRate.toFixed(1)}%`,
      isPositive,
    };
  }

  /**
   * Get revenue trend chart data
   */
  async getRevenueTrend(startDate?: string, endDate?: string): Promise<RevenueTrendDto> {
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Get revenue grouped by month
    const revenueData = await this.orderRepository
      .createQueryBuilder('order')
      .select('DATE_TRUNC(\'month\', order.createdAt)', 'month')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .where('order.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere('order.paymentStatus = :status', { status: 'paid' })
      .groupBy('DATE_TRUNC(\'month\', order.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    const data: ChartDataPointDto[] = revenueData.map((item) => ({
      name: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
      value: parseFloat(item.revenue || '0'),
      date: item.month,
    }));

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const average = data.length > 0 ? total / data.length : 0;

    return { data, total, average };
  }

  /**
   * Get customer growth chart data
   */
  async getCustomerGrowth(startDate?: string, endDate?: string): Promise<CustomerGrowthDto> {
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Get customers grouped by month
    const customerData = await this.customerRepository
      .createQueryBuilder('customer')
      .select('DATE_TRUNC(\'month\', customer.createdAt)', 'month')
      .addSelect('COUNT(customer.id)', 'count')
      .where('customer.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('DATE_TRUNC(\'month\', customer.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    const data: ChartDataPointDto[] = customerData.map((item) => ({
      name: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
      value: parseInt(item.count || '0'),
      date: item.month,
    }));

    const totalNew = data.reduce((sum, item) => sum + item.value, 0);

    // Calculate growth rate from first to last month
    const firstMonth = data[0]?.value || 0;
    const lastMonth = data[data.length - 1]?.value || 0;
    const growthRate = firstMonth > 0 ? ((lastMonth - firstMonth) / firstMonth) * 100 : 0;
    const sign = growthRate >= 0 ? '+' : '';

    return {
      data,
      totalNew,
      growthRate: `${sign}${growthRate.toFixed(1)}%`,
    };
  }
}
