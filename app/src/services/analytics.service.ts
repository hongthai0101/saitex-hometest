import { apiService } from './api'
import type {
  SummaryMetrics,
  RevenueTrend,
  CustomerGrowth,
  AnalyticsQuery,
} from '@/types/analytics'

class AnalyticsService {
  async getSummaryMetrics(query?: AnalyticsQuery): Promise<SummaryMetrics> {
    const params = new URLSearchParams()
    if (query?.startDate) params.append('startDate', query.startDate)
    if (query?.endDate) params.append('endDate', query.endDate)

    const response = await apiService.get<SummaryMetrics>(
      `/analytics/summary?${params.toString()}`
    )
    return response.data
  }

  async getRevenueTrend(query?: AnalyticsQuery): Promise<RevenueTrend> {
    const params = new URLSearchParams()
    if (query?.startDate) params.append('startDate', query.startDate)
    if (query?.endDate) params.append('endDate', query.endDate)

    const response = await apiService.get<any>(
      `/analytics/revenue-trend?${params.toString()}`
    )
    // API returns array directly in data field
    return { data: response.data }
  }

  async getCustomerGrowth(query?: AnalyticsQuery): Promise<CustomerGrowth> {
    const params = new URLSearchParams()
    if (query?.startDate) params.append('startDate', query.startDate)
    if (query?.endDate) params.append('endDate', query.endDate)

    const response = await apiService.get<any>(
      `/analytics/customer-growth?${params.toString()}`
    )
    // API returns array directly in data field
    return { data: response.data }
  }
}

export const analyticsService = new AnalyticsService()
