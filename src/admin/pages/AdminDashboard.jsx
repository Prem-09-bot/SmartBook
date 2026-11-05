
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RefreshCw,
  ShoppingBag,
  Users,
  BookOpen,
  IndianRupee,
  AlertTriangle,
  ArrowUpRight,
  Package,
  Clock,
} from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'

const API_URL = '/api/admin/dashboard'

const currency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)

const statusStyles = {
  delivered: 'bg-emerald-500/10 text-emerald-400',
  processing: 'bg-blue-500/10 text-blue-400',
  pending: 'bg-amber-500/10 text-amber-400',
  shipped: 'bg-purple-500/10 text-purple-400',
  cancelled: 'bg-red-500/10 text-red-400',
}

function StatusBadge({ status }) {
  const normalized = String(status || 'unknown').toLowerCase()

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs capitalize ${
        statusStyles[normalized] || 'bg-white/10 text-white'
      }`}
    >
      {normalized}
    </span>
  )
}

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#151515] p-5 transition hover:border-[#C6A66B]/30">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#A6A29A]">{title}</p>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C6A66B]/10">
          <Icon size={18} className="text-[#C6A66B]" />
        </div>
      </div>

      <h3 className="mt-4 break-words text-2xl font-semibold text-[#F5F0E6]">
        {value}
      </h3>

      <p className="mt-2 text-xs text-[#77736C]">{description}</p>
    </div>
  )
}

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-xl border border-white/10 bg-[#151515] p-5">
      <div className="h-4 w-28 rounded bg-white/10" />
      <div className="mt-5 h-8 w-36 rounded bg-white/10" />
      <div className="mt-3 h-3 w-24 rounded bg-white/5" />
    </div>
  )
}

export default function AdminDashboard() {
  const { token, adminLogout } = useAdminAuth()

  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboard = useCallback(async (isRefresh = false) => {
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
        throw new Error(result.message || 'Unable to load dashboard data.')
      }

      setDashboard(result.data)
    } catch (err) {
      setError(err.message || 'Something went wrong while loading the dashboard.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const statistics = dashboard?.statistics || {}
  const recentOrders = dashboard?.recentOrders || []
  const lowStockBooks = dashboard?.lowStockBooks || []

  const orderStatuses = [
    { label: 'Pending', value: Number(statistics.pendingOrders) || 0 },
    { label: 'Processing', value: Number(statistics.processingOrders) || 0 },
    { label: 'Shipped', value: Number(statistics.shippedOrders) || 0 },
    { label: 'Delivered', value: Number(statistics.deliveredOrders) || 0 },
    { label: 'Cancelled', value: Number(statistics.cancelledOrders) || 0 },
  ]

  const totalStatusOrders = orderStatuses.reduce(
    (sum, item) => sum + item.value,
    0
  )

  const statCards = [
    {
      title: 'Total Revenue',
      value: currency(statistics.totalRevenue),
      description: 'Lifetime paid orders',
      icon: IndianRupee,
    },
    {
      title: 'Total Orders',
      value: Number(statistics.totalOrders) || 0,
      description: 'All recorded orders',
      icon: ShoppingBag,
    },
    {
      title: 'Total Customers',
      value: Number(statistics.totalCustomers) || 0,
      description: 'Registered customer accounts',
      icon: Users,
    },
    {
      title: 'Active Books',
      value: Number(statistics.totalActiveBooks) || 0,
      description: 'Currently active books',
      icon: BookOpen,
    },
  ]

  const getOrderValue = (order, snakeCase, camelCase) =>
    order?.[snakeCase] ?? order?.[camelCase]

  const getOrderNumber = (order) =>
    getOrderValue(order, 'order_number', 'orderNumber') ||
    `#${order.id}`

  const getCustomerName = (order) =>
    getOrderValue(order, 'customer_name', 'customerName') ||
    getOrderValue(order, 'name', 'customer') ||
    'Unknown customer'

  const getCustomerEmail = (order) =>
    getOrderValue(order, 'customer_email', 'customerEmail') ||
    order.email ||
    'No email available'

  const getOrderAmount = (order) =>
    getOrderValue(order, 'total_amount', 'totalAmount') ?? 0

  const getOrderStatus = (order) =>
    getOrderValue(order, 'order_status', 'orderStatus') || 'pending'

  const getBookStock = (book) =>
    Number(book.stock_quantity ?? book.stockQuantity ?? book.stock ?? 0)

  const getBookTitle = (book) =>
    book.title || book.book_title || book.bookTitle || 'Untitled book'

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 text-[#F5F0E6] sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#C6A66B]">
            SmartBook Administration
          </p>

          <h1 className="mt-2 font-editorial text-3xl sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-[#A6A29A]">
            Live overview of your SmartBook store.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchDashboard(true)}
          disabled={loading || refreshing}
          className="flex items-center justify-center gap-2 border border-white/10 bg-[#151515] px-4 py-3 text-sm text-[#C6A66B] transition hover:border-[#C6A66B]/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? 'animate-spin' : ''}
          />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex flex-col justify-between gap-3 border border-red-400/20 bg-red-400/5 p-4 sm:flex-row sm:items-center">
          <p className="text-sm text-red-300">{error}</p>

          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            className="shrink-0 text-sm text-[#C6A66B] hover:text-[#E0C58A]"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading && !dashboard
          ? Array.from({ length: 4 }).map((_, index) => (
              <LoadingCard key={index} />
            ))
          : statCards.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
      </div>

      {/* Order Status */}
      <div className="mt-8 rounded-xl border border-white/10 bg-[#151515] p-5 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium">Order Status Overview</h2>
          <p className="mt-1 text-xs text-[#A6A29A]">
            Distribution of all recorded orders
          </p>
        </div>

        {loading && !dashboard ? (
          <div className="h-32 animate-pulse rounded bg-white/5" />
        ) : (
          <div className="space-y-5">
            {orderStatuses.map((item) => {
              const percentage = totalStatusOrders
                ? (item.value / totalStatusOrders) * 100
                : 0

              return (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-[#A6A29A]">{item.label}</span>
                    <span className="text-[#F5F0E6]">{item.value}</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-[#C6A66B] transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}

            {totalStatusOrders === 0 && (
              <p className="text-sm text-[#77736C]">
                No orders have been recorded yet.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Inventory Alerts */}
      <div className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-[#151515]">
        <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle size={17} className="text-[#C6A66B]" />
              <h2 className="text-lg font-medium">Inventory Alerts</h2>
            </div>

            <p className="mt-1 text-xs text-[#A6A29A]">
              Books requiring stock attention
            </p>
          </div>

          <Link
            to="/admin/books"
            className="flex items-center gap-2 text-xs text-[#C6A66B] transition hover:text-[#E0C58A]"
          >
            Manage Books
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-white/10 p-5 sm:grid-cols-3 sm:p-6">
          <div>
            <p className="text-xs text-[#A6A29A]">Low Stock</p>
            <p className="mt-2 text-2xl font-semibold text-amber-400">
              {loading && !dashboard ? '—' : Number(statistics.lowStockCount) || 0}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#A6A29A]">Out of Stock</p>
            <p className="mt-2 text-2xl font-semibold text-red-400">
              {loading && !dashboard ? '—' : Number(statistics.outOfStockCount) || 0}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs text-[#A6A29A]">Active Books</p>
            <p className="mt-2 text-2xl font-semibold text-[#F5F0E6]">
              {loading && !dashboard ? '—' : Number(statistics.totalActiveBooks) || 0}
            </p>
          </div>
        </div>

        {lowStockBooks.length > 0 ? (
          <div className="divide-y divide-white/5">
            {lowStockBooks.map((book) => (
              <div
                key={book.id}
                className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Package size={17} className="shrink-0 text-[#C6A66B]" />
                  <p className="truncate text-sm text-[#F5F0E6]">
                    {getBookTitle(book)}
                  </p>
                </div>

                <span
                  className={`shrink-0 text-xs ${
                    getBookStock(book) === 0
                      ? 'text-red-400'
                      : 'text-amber-400'
                  }`}
                >
                  {getBookStock(book) === 0
                    ? 'Out of stock'
                    : `${getBookStock(book)} left`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-6 text-sm text-[#77736C]">
            {loading
              ? 'Loading inventory...'
              : 'No low-stock books found.'}
          </p>
        )}
      </div>

      {/* Recent Orders */}
      <div className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-[#151515]">
        <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-medium">Recent Orders</h2>
            <p className="mt-1 text-xs text-[#A6A29A]">
              Latest activity from your store
            </p>
          </div>

          <Link
            to="/admin/orders"
            className="flex items-center gap-2 text-xs text-[#C6A66B] transition hover:text-[#E0C58A]"
          >
            View all
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs text-[#77736C]">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {loading && !dashboard ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm text-[#77736C]">
                    Loading recent orders...
                  </td>
                </tr>
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr
                    key={order.id || order.order_number || order.orderNumber}
                    className="border-b border-white/5 transition hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4 text-sm text-[#C6A66B]">
                      {getOrderNumber(order)}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-[#F5F0E6]">
                        {getCustomerName(order)}
                      </p>
                      <p className="mt-1 text-xs text-[#77736C]">
                        {getCustomerEmail(order)}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-[#F5F0E6]">
                      {currency(getOrderAmount(order))}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge
                        status={getOrderValue(order, 'payment_status', 'paymentStatus')}
                      />
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={getOrderStatus(order)} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm text-[#77736C]">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-8 flex items-center justify-center gap-2 text-xs text-[#77736C]">
        <Clock size={13} />
        SmartBook Admin Panel · Live Database
      </p>
    </div>
  )
}

