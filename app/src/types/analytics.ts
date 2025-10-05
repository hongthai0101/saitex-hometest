export interface Metric {
  current: number
  previous: number
  growthRate: string
  isPositive: boolean
}

export interface SummaryMetrics {
  totalRevenue: Metric
  totalCustomers: Metric
  totalOrders: Metric
  totalProducts: Metric
}

export interface ChartDataPoint {
  name: string
  value: number
  date: string
}

export interface RevenueTrend {
  data: ChartDataPoint[]
  total?: number
  average?: number
}

export interface CustomerGrowth {
  data: ChartDataPoint[]
  totalNew?: number
  growthRate?: string
}

export interface AnalyticsQuery {
  startDate?: string
  endDate?: string
}
