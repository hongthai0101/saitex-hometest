import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { analyticsService } from '@/services/analytics.service'
import { DateRangePicker } from '@/components/common/DateRangePicker'
import type { AnalyticsQuery } from '@/types/analytics'
import '@/assets/styles/datepicker.css'

export default function DashboardPage() {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [appliedFilter, setAppliedFilter] = useState<AnalyticsQuery>({})

  const { data: summaryMetrics, isLoading: summaryLoading } = useQuery({
    queryKey: ['analytics-summary', appliedFilter],
    queryFn: () => analyticsService.getSummaryMetrics(appliedFilter),
  })

  const { data: revenueTrend, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue-trend', appliedFilter],
    queryFn: () => analyticsService.getRevenueTrend(appliedFilter),
  })

  const { data: customerGrowth, isLoading: customerLoading } = useQuery({
    queryKey: ['customer-growth', appliedFilter],
    queryFn: () => analyticsService.getCustomerGrowth(appliedFilter),
  })

  const handleApplyFilter = () => {
    const filter: AnalyticsQuery = {}
    if (startDate) {
      filter.startDate = startDate.toISOString().split('T')[0]
    }
    if (endDate) {
      filter.endDate = endDate.toISOString().split('T')[0]
    }
    setAppliedFilter(filter)
  }

  const handleResetFilter = () => {
    setStartDate(null)
    setEndDate(null)
    setAppliedFilter({})
  }

  return (
    <div className="h-full overflow-auto bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your analytics and metrics</p>
        </div>

        {/* Date Range Filter */}
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onApply={handleApplyFilter}
          onReset={handleResetFilter}
        />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Revenue"
            value={
              summaryLoading
                ? 'Loading...'
                : `$${summaryMetrics?.totalRevenue?.current?.toLocaleString() || 0}`
            }
            change={summaryMetrics?.totalRevenue?.growthRate || '0%'}
            isPositive={summaryMetrics?.totalRevenue?.isPositive ?? true}
          />
          <StatsCard
            title="Total Customers"
            value={
              summaryLoading
                ? 'Loading...'
                : summaryMetrics?.totalCustomers?.current?.toLocaleString() || '0'
            }
            change={summaryMetrics?.totalCustomers?.growthRate || '0%'}
            isPositive={summaryMetrics?.totalCustomers?.isPositive ?? true}
          />
          <StatsCard
            title="Total Orders"
            value={
              summaryLoading
                ? 'Loading...'
                : summaryMetrics?.totalOrders?.current?.toLocaleString() || '0'
            }
            change={summaryMetrics?.totalOrders?.growthRate || '0%'}
            isPositive={summaryMetrics?.totalOrders?.isPositive ?? true}
          />
          <StatsCard
            title="Total Products"
            value={
              summaryLoading
                ? 'Loading...'
                : summaryMetrics?.totalProducts?.current?.toLocaleString() || '0'
            }
            change={summaryMetrics?.totalProducts?.growthRate || '0%'}
            isPositive={summaryMetrics?.totalProducts?.isPositive ?? true}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Revenue Trend</h2>
              {!revenueLoading && revenueTrend?.data && revenueTrend.data.length > 0 && (
                <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                  <span>
                    Total: <strong>${revenueTrend.data.reduce((sum, item) => sum + item.value, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                  </span>
                  <span>
                    Average: <strong>${(revenueTrend.data.reduce((sum, item) => sum + item.value, 0) / revenueTrend.data.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                  </span>
                </div>
              )}
            </div>
            {revenueLoading ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueTrend?.data || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis
                    stroke="#9ca3af"
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.375rem',
                      color: '#fff',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 'Revenue']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Revenue"
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Customer Growth</h2>
              {!customerLoading && customerGrowth?.data && customerGrowth.data.length > 0 && (
                <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                  <span>
                    Total New: <strong>{customerGrowth.data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}</strong>
                  </span>
                  {customerGrowth.data.length > 1 && customerGrowth.data[0] && customerGrowth.data[customerGrowth.data.length - 1] && (
                    <span>
                      Growth: <strong className={
                        customerGrowth.data[customerGrowth.data.length - 1]!.value >= customerGrowth.data[0]!.value
                          ? 'text-green-600'
                          : 'text-red-600'
                      }>
                        {customerGrowth.data[0]!.value > 0
                          ? `${((customerGrowth.data[customerGrowth.data.length - 1]!.value - customerGrowth.data[0]!.value) / customerGrowth.data[0]!.value * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </strong>
                    </span>
                  )}
                </div>
              )}
            </div>
            {customerLoading ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={customerGrowth?.data || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.375rem',
                      color: '#fff',
                    }}
                    formatter={(value: number) => [value, 'New Customers']}
                  />
                  <Legend />
                  <Bar
                    dataKey="value"
                    fill="#8b5cf6"
                    name="New Customers"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string
  change: string
  isPositive?: boolean
}

function StatsCard({ title, value, change, isPositive = true }: StatsCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div className="mt-2 flex items-baseline justify-between">
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <span
          className={`text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {change}
        </span>
      </div>
    </div>
  )
}
