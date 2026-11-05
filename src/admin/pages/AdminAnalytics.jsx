
import { useCallback, useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

import {
  IndianRupee,
  ShoppingBag,
  Users,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

import { useAdminAuth } from '../../context/AdminAuthContext'

const API_URL = '/api/admin/analytics'

const COLORS = ['#C6A66B', '#8B7355', '#6D5D45', '#A6A29A']

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="border border-[#C6A66B]/30 bg-[#151515] px-4 py-3 shadow-xl">
      <p className="mb-2 text-xs text-[#A6A29A]">{label}</p>

      {payload.map((item, index) => (
        <p key={index} className="text-sm font-medium text-[#C6A66B]">
          {item.name === 'Revenue'
            ? formatCurrency(item.value)
            : `${item.name}: ${Number(item.value).toLocaleString('en-IN')}`}
        </p>
      ))}
    </div>
  )
}

function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="border border-[#C6A66B]/20 bg-[#151515] p-5 transition hover:border-[#C6A66B]/40">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[#A6A29A]">{title}</p>

        <div className="bg-[#C6A66B]/10 p-2.5 text-[#C6A66B]">
          <Icon size={20} />
        </div>
      </div>

      <h2 className="break-words font-editorial text-2xl sm:text-3xl">
        {value}
      </h2>

      <p className="mt-3 text-xs text-[#77736C]">{description}</p>
    </div>
  )
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="border border-white/10 bg-[#151515] p-5 sm:p-6">
      <div className="mb-6">
        <h2 className="font-editorial text-xl sm:text-2xl">{title}</h2>
        <p className="mt-1 text-xs text-[#A6A29A]">{subtitle}</p>
      </div>

      {children}
    </div>
  )
}

export default function AdminAnalytics() {
  const { token, adminLogout } = useAdminAuth()

  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (!token) {
      setError('Admin authentication token is missing. Please sign in again.')
      setLoading(false)
      return
    }

    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError('')

    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.status === 401 || response.status === 403) {
        adminLogout()
        throw new Error('Your admin session has expired. Please sign in again.')
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to load analytics.')
      }

      setAnalytics(result.data)
    } catch (err) {
      setError(err.message || 'Something went wrong while loading analytics.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token, adminLogout])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const summary = analytics?.summary || {}
  const monthlyData = analytics?.monthlyData || []
  const topBooks = analytics?.topSellingBooks || []
  const paymentMethods = analytics?.paymentMethods || []

  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(summary.totalRevenue),
      description: 'Revenue from paid orders',
      icon: IndianRupee,
    },
    {
      title: 'Total Orders',
      value: Number(summary.totalOrders || 0).toLocaleString('en-IN'),
      description: 'All recorded orders',
      icon: ShoppingBag,
    },
    {
      title: 'Ordering Customers',
      value: Number(summary.orderingCustomers || 0).toLocaleString('en-IN'),
      description: 'Customers who placed orders',
      icon: Users,
    },
    {
      title: 'Paid Orders',
      value: Number(summary.paidOrders || 0).toLocaleString('en-IN'),
      description: 'Successfully paid orders',
      icon: TrendingUp,
    },
  ]

  const totalPaymentOrders = paymentMethods.reduce(
    (sum, item) => sum + Number(item.totalOrders || 0),
    0
  )

  return (
    <div className="min-h-screen bg-[#0B0B0C] px-4 py-8 text-[#F5F0E6] sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#C6A66B]">
            Business Intelligence
          </p>

          <h1 className="font-editorial text-3xl sm:text-4xl">
            Analytics Overview
          </h1>

          <p className="mt-2 text-sm text-[#A6A29A]">
            Real-time business insights from your SmartBook database.
          </p>

          <p className="mt-2 text-xs text-[#77736C]">
            Reporting period: Last 12 months
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchAnalytics(true)}
          disabled={loading || refreshing}
          className="flex items-center justify-center gap-2 border border-white/10 bg-[#151515] px-4 py-3 text-sm text-[#C6A66B] transition hover:border-[#C6A66B]/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? 'animate-spin' : ''}
          />
          {refreshing ? 'Refreshing...' : 'Refresh Analytics'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex flex-col justify-between gap-3 border border-red-400/20 bg-red-400/5 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm text-red-300">
            <AlertCircle size={17} />
            {error}
          </div>

          <button
            type="button"
            onClick={() => fetchAnalytics(true)}
            className="shrink-0 text-sm text-[#C6A66B] hover:text-[#E0C58A]"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading && !analytics
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse border border-white/10 bg-[#151515]"
              />
            ))
          : stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
      </div>

      {/* Revenue Chart */}
      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="border border-white/10 bg-[#151515] p-5 xl:col-span-2 sm:p-6">
          <div className="mb-6">
            <h2 className="font-editorial text-xl sm:text-2xl">
              Revenue Overview
            </h2>

            <p className="mt-1 text-xs text-[#A6A29A]">
              Monthly revenue from successfully paid orders
            </p>
          </div>

          <div className="h-[280px] w-full">
            {loading && !analytics ? (
              <div className="h-full animate-pulse bg-white/5" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient
                      id="liveRevenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#C6A66B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C6A66B" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#ffffff"
                    strokeOpacity={0.06}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                    stroke="#777"
                    tick={{ fill: '#A6A29A', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    stroke="#777"
                    tick={{ fill: '#A6A29A', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#C6A66B"
                    strokeWidth={2.5}
                    fill="url(#liveRevenueGradient)"
                    activeDot={{ r: 5, fill: '#C6A66B' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <ChartCard
          title="Payment Methods"
          subtitle="Order distribution by payment method"
        >
          {loading && !analytics ? (
            <div className="h-[220px] animate-pulse bg-white/5" />
          ) : (
            <>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethods}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="totalOrders"
                      nameKey="paymentMethod"
                      stroke="none"
                    >
                      {paymentMethods.map((entry, index) => (
                        <Cell
                          key={entry.paymentMethod}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#151515',
                        border: '1px solid #C6A66B',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((payment, index) => (
                  <div
                    key={payment.paymentMethod}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 text-[#A6A29A]">
                      <span
                        className="h-2.5 w-2.5"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      {payment.paymentMethod}
                    </div>

                    <div className="text-right">
                      <p className="text-[#F5F0E6]">
                        {payment.totalOrders} orders
                      </p>
                      <p className="mt-1 text-[#C6A66B]">
                        {formatCurrency(payment.revenue)}
                      </p>
                    </div>
                  </div>
                ))}

                {paymentMethods.length === 0 && (
                  <p className="text-center text-xs text-[#77736C]">
                    No payment records available.
                  </p>
                )}

                {totalPaymentOrders > 0 && (
                  <p className="border-t border-white/10 pt-3 text-xs text-[#77736C]">
                    {totalPaymentOrders} total orders
                  </p>
                )}
              </div>
            </>
          )}
        </ChartCard>
      </div>

      {/* Monthly Orders and Customer Registrations */}
      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

        <ChartCard
          title="Order Performance"
          subtitle="Actual monthly order volume"
        >
          <div className="h-[280px] w-full">
            {loading && !analytics ? (
              <div className="h-full animate-pulse bg-white/5" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid
                    stroke="#ffffff"
                    strokeOpacity={0.06}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                    stroke="#777"
                    tick={{ fill: '#A6A29A', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    stroke="#777"
                    tick={{ fill: '#A6A29A', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Bar
                    dataKey="totalOrders"
                    name="Orders"
                    fill="#C6A66B"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard
          title="Customer Growth"
          subtitle="New customer registrations by month"
        >
          <div className="h-[280px] w-full">
            {loading && !analytics ? (
              <div className="h-full animate-pulse bg-white/5" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient
                      id="liveCustomerGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#8B7355" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B7355" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#ffffff"
                    strokeOpacity={0.06}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                    stroke="#777"
                    tick={{ fill: '#A6A29A', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    stroke="#777"
                    tick={{ fill: '#A6A29A', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="newCustomers"
                    name="New Customers"
                    stroke="#8B7355"
                    strokeWidth={2.5}
                    fill="url(#liveCustomerGradient)"
                    activeDot={{ r: 5, fill: '#C6A66B' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Top Selling Books */}
      <div className="border border-white/10 bg-[#151515]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-editorial text-xl sm:text-2xl">
              Top Selling Books
            </h2>

            <p className="mt-1 text-xs text-[#A6A29A]">
              Ranked using actual paid, non-cancelled orders
            </p>
          </div>

          <span className="text-xs text-[#C6A66B]">Top 5</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead className="border-b border-white/10 bg-[#0B0B0C]">
              <tr className="text-xs uppercase tracking-wider text-[#A6A29A]">
                <th className="px-5 py-4 font-medium">Rank</th>
                <th className="px-5 py-4 font-medium">Book</th>
                <th className="px-5 py-4 font-medium">Units Sold</th>
                <th className="px-5 py-4 text-right font-medium">Revenue</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading && !analytics ? (
                <tr>
                  <td colSpan="4" className="px-5 py-10 text-center text-sm text-[#77736C]">
                    Loading book analytics...
                  </td>
                </tr>
              ) : topBooks.length > 0 ? (
                topBooks.map((book, index) => (
                  <tr
                    key={book.bookId ?? `${book.title}-${index}`}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <span
                        className={`flex h-8 w-8 items-center justify-center text-xs font-semibold ${
                          index === 0
                            ? 'bg-[#C6A66B] text-black'
                            : 'bg-white/5 text-[#A6A29A]'
                        }`}
                      >
                        #{index + 1}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium">{book.title}</p>
                      <p className="mt-1 text-xs text-[#A6A29A]">
                        {book.author || 'Unknown author'}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-[#A6A29A]">
                      {Number(book.unitsSold || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-medium text-[#C6A66B]">
                      {formatCurrency(book.revenue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-5 py-10 text-center text-sm text-[#77736C]">
                    No paid book sales recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-[#77736C]">
        SmartBook Analytics · Live Database Reports
      </p>
    </div>
  )
}
