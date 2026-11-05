import { useCallback, useEffect, useState } from 'react'
import {
  Search,
  Eye,
  X,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  IndianRupee,
  Package,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
} from 'lucide-react'

import { useAdminAuth } from '../../context/AdminAuthContext'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ''
).replace(/\/$/, '')

const PAGE_SIZE = 10

const statuses = [
  'All',
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
]

const statusStyles = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
}

const nextStatuses = {
  pending: ['processing'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0)

const formatDate = (date) => {
  if (!date) return '—'

  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const capitalize = (value = '') =>
  value.charAt(0).toUpperCase() + value.slice(1)

export default function AdminOrders() {
  const { token, adminLogout } = useAdminAuth()

  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  })

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  })

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  const apiRequest = useCallback(
    async (endpoint, options = {}) => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      })

      const result = await response.json()

      if (response.status === 401 || response.status === 403) {
        adminLogout()
        throw new Error('Your admin session has expired. Please sign in again.')
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Request failed.')
      }

      return result
    },
    [token, adminLogout],
  )

  const loadOrders = useCallback(
    async (showLoader = true) => {
      if (!token) return

      if (showLoader) setLoading(true)
      setError('')
      setActionMessage('')

      try {
        const params = new URLSearchParams({
          page: String(pagination.page),
          limit: String(PAGE_SIZE),
        })

        if (search.trim()) {
          params.set('search', search.trim())
        }

        if (statusFilter !== 'All') {
          params.set('orderStatus', statusFilter.toLowerCase())
        }

        const [ordersResult, statsResults] = await Promise.all([
          apiRequest(`/api/admin/orders?${params.toString()}`),

          Promise.all([
            apiRequest('/api/admin/orders?page=1&limit=1'),
            ...['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(
              (status) =>
                apiRequest(
                  `/api/admin/orders?page=1&limit=1&orderStatus=${status}`,
                ),
            ),
          ]),
        ])

        setOrders(ordersResult.data.orders || [])
        setPagination(ordersResult.data.pagination)

        const totals = statsResults.map(
          (result) => result.data.pagination.total,
        )

        setStatistics({
          total: totals[0] || 0,
          pending: totals[1] || 0,
          processing: totals[2] || 0,
          shipped: totals[3] || 0,
          delivered: totals[4] || 0,
          cancelled: totals[5] || 0,
        })
      } catch (err) {
        setError(err.message || 'Unable to load orders.')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [apiRequest, token, pagination.page, search, statusFilter],
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders()
    }, 300)

    return () => clearTimeout(timer)
  }, [loadOrders])

  const refreshOrders = () => {
    setRefreshing(true)
    loadOrders(false)
  }

  const openOrderDetails = async (orderId) => {
    setSelectedOrder(null)
    setDetailsLoading(true)
    setError('')

    try {
      const result = await apiRequest(`/api/admin/orders/${orderId}`)

      setSelectedOrder({
        ...result.data.order,
        items: result.data.items || [],
        payments: result.data.payments || [],
      })
    } catch (err) {
      setError(err.message || 'Unable to load order details.')
    } finally {
      setDetailsLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus) => {
    if (!selectedOrder || updating) return

    setUpdating(true)
    setActionMessage('')

    try {
      await apiRequest(
        `/api/admin/orders/${selectedOrder.id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            orderStatus: newStatus,
          }),
        },
      )

      await loadOrders(false)

      const result = await apiRequest(
        `/api/admin/orders/${selectedOrder.id}`,
      )

      setSelectedOrder({
        ...result.data.order,
        items: result.data.items || [],
        payments: result.data.payments || [],
      })

      setActionMessage('Order status updated successfully.')
    } catch (err) {
      setActionMessage(err.message || 'Unable to update order status.')
    } finally {
      setUpdating(false)
    }
  }

  const handleFilterChange = (status) => {
    setStatusFilter(status)
    setPagination((previous) => ({
      ...previous,
      page: 1,
    }))
  }

  const handleSearchChange = (value) => {
    setSearch(value)
    setPagination((previous) => ({
      ...previous,
      page: 1,
    }))
  }

  const currentStatus = selectedOrder?.order_status || ''
  const availableStatuses = nextStatuses[currentStatus] || []

  return (
    <div className="min-h-screen bg-[#0B0B0C] px-4 py-8 text-[#F5F0E6] sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#C6A66B]">
            Store Management
          </p>

          <h1 className="font-editorial text-3xl sm:text-4xl">
            Orders
          </h1>

          <p className="mt-2 text-sm text-[#A6A29A]">
            Track, manage, and fulfill customer orders.
          </p>
        </div>

        <button
          onClick={refreshOrders}
          disabled={refreshing || loading}
          className="inline-flex items-center justify-center gap-2 border border-white/10 px-4 py-3 text-sm text-[#C6A66B] transition hover:border-[#C6A66B]/50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? 'animate-spin' : ''}
          />
          Refresh Orders
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={statistics.total}
          icon={ShoppingBag}
          color="text-[#C6A66B]"
        />

        <StatCard
          title="Pending Orders"
          value={statistics.pending}
          icon={Clock}
          color="text-yellow-400"
        />

        <StatCard
          title="Processing"
          value={statistics.processing}
          icon={Package}
          color="text-blue-400"
        />

        <StatCard
          title="Delivered Revenue"
          value={formatCurrency(0)}
          icon={IndianRupee}
          color="text-green-400"
          subtitle="See note below"
        />
      </div>

      <div className="mb-6 border border-white/10 bg-[#151515] p-4">
        <p className="text-xs leading-6 text-[#A6A29A]">
          Revenue is calculated from successfully paid orders, not simply
          delivered orders. Use the Payments page for the actual collected
          payment records.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 border border-white/10 bg-[#151515] px-4 py-3 lg:w-80">
          <Search size={18} className="text-[#A6A29A]" />

          <input
            type="text"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search order or customer..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#777]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => {
            const count =
              status === 'All'
                ? statistics.total
                : statistics[status.toLowerCase()]

            return (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`border px-3 py-2 text-xs transition ${
                  statusFilter === status
                    ? 'border-[#C6A66B] bg-[#C6A66B] text-black'
                    : 'border-white/10 text-[#A6A29A] hover:border-[#C6A66B]/40 hover:text-[#F5F0E6]'
                }`}
              >
                {status}
                <span className="ml-1.5">({count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden border border-white/10 bg-[#151515]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-editorial text-xl">
            All Orders
          </h2>

          <span className="text-xs text-[#A6A29A]">
            {pagination.total} results
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="border-b border-white/10 bg-[#0B0B0C]">
              <tr className="text-xs uppercase tracking-wider text-[#A6A29A]">
                <th className="px-5 py-4 font-medium">Order ID</th>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Date</th>
                <th className="px-5 py-4 font-medium">Items</th>
                <th className="px-5 py-4 font-medium">Amount</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {!loading &&
                orders.map((order) => {
                  const status = order.orderStatus
                  const StatusIcon = statusIcons[status] || Clock

                  return (
                    <tr
                      key={order.id}
                      className="transition hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-[#C6A66B]">
                          #{order.orderNumber}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm">{order.customerName}</p>
                        <p className="mt-1 text-xs text-[#777]">
                          {order.customerEmail}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-[#A6A29A]">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="px-5 py-4 text-sm text-[#A6A29A]">
                        {order.itemCount}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium">
                        {formatCurrency(order.totalAmount)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs ${
                            statusStyles[status] || ''
                          }`}
                        >
                          <StatusIcon size={13} />
                          {capitalize(status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => openOrderDetails(order.id)}
                          className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-xs text-[#A6A29A] transition hover:border-[#C6A66B]/40 hover:text-[#C6A66B]"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>

          {loading && (
            <div className="flex items-center justify-center gap-3 py-16 text-sm text-[#A6A29A]">
              <RefreshCw size={18} className="animate-spin" />
              Loading orders...
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="py-16 text-center text-sm text-[#A6A29A]">
              No orders found.
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
            <p className="text-xs text-[#A6A29A]">
              Page {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((previous) => ({
                    ...previous,
                    page: previous.page - 1,
                  }))
                }
                className="border border-white/10 p-2 text-[#A6A29A] hover:border-[#C6A66B]/50 disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPagination((previous) => ({
                    ...previous,
                    page: previous.page + 1,
                  }))
                }
                className="border border-white/10 p-2 text-[#A6A29A] hover:border-[#C6A66B]/50 disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Loading */}
      {detailsLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="flex items-center gap-3 text-sm text-[#C6A66B]">
            <RefreshCw size={20} className="animate-spin" />
            Loading order details...
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl border border-[#C6A66B]/20 bg-[#151515]">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#C6A66B]">
                  Order Details
                </p>

                <h2 className="mt-2 font-editorial text-2xl">
                  #{selectedOrder.order_number}
                </h2>
              </div>

              <button
                onClick={() => {
                  setSelectedOrder(null)
                  setActionMessage('')
                }}
                className="text-[#A6A29A] transition hover:text-white"
                aria-label="Close order details"
              >
                <X size={22} />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6">

              {/* Customer Details */}
              <section>
                <h3 className="mb-3 text-xs uppercase tracking-wider text-[#C6A66B]">
                  Customer Information
                </h3>

                <p className="text-sm">
                  {selectedOrder.customerName}
                </p>

                <p className="mt-2 flex items-center gap-2 text-sm text-[#A6A29A]">
                  <Mail size={14} />
                  {selectedOrder.customerEmail}
                </p>

                <p className="mt-2 flex items-center gap-2 text-sm text-[#A6A29A]">
                  <Phone size={14} />
                  {selectedOrder.shipping_phone || 'Phone not available'}
                </p>

                <p className="mt-2 flex items-start gap-2 text-sm text-[#A6A29A]">
                  <MapPin size={14} className="mt-1 shrink-0" />
                  <span>
                    {[
                      selectedOrder.shipping_address,
                      selectedOrder.shipping_city,
                      selectedOrder.shipping_state,
                      selectedOrder.shipping_postal_code,
                    ]
                      .filter(Boolean)
                      .join(', ') || 'Address not available'}
                  </span>
                </p>
              </section>

              {/* Items */}
              <section>
                <h3 className="mb-3 text-xs uppercase tracking-wider text-[#C6A66B]">
                  Ordered Items
                </h3>

                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 border-b border-white/5 pb-3"
                    >
                      <div>
                        <p className="text-sm">{item.book_title}</p>
                        <p className="mt-1 text-xs text-[#A6A29A]">
                          {item.book_author || 'Unknown author'} · Qty: {item.quantity}
                        </p>
                        <p className="mt-1 text-xs text-[#777]">
                          Unit price: {formatCurrency(item.unit_price)}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  ))}

                  {selectedOrder.items.length === 0 && (
                    <p className="text-sm text-[#A6A29A]">
                      No item records found.
                    </p>
                  )}
                </div>
              </section>

              {/* Payment Summary */}
              <section className="space-y-2 border-t border-white/10 pt-4">
                <div className="flex justify-between text-sm text-[#A6A29A]">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm text-[#A6A29A]">
                  <span>Discount</span>
                  <span>-{formatCurrency(selectedOrder.discount)}</span>
                </div>

                <div className="flex justify-between text-sm text-[#A6A29A]">
                  <span>Delivery</span>
                  <span>{formatCurrency(selectedOrder.shipping_charge)}</span>
                </div>

                <div className="flex justify-between border-t border-white/10 pt-3 text-base font-semibold">
                  <span>Total</span>
                  <span className="text-[#C6A66B]">
                    {formatCurrency(selectedOrder.total_amount)}
                  </span>
                </div>

                <p className="pt-2 text-xs text-[#A6A29A]">
                  Payment Method: {selectedOrder.payment_method}
                </p>

                <p className="text-xs text-[#A6A29A]">
                  Payment Status: {capitalize(selectedOrder.payment_status)}
                </p>
              </section>

              {/* Payment Records */}
              <section>
                <h3 className="mb-3 text-xs uppercase tracking-wider text-[#C6A66B]">
                  Payment Records
                </h3>

                {selectedOrder.payments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrder.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="border border-white/10 p-3 text-xs"
                      >
                        <div className="flex justify-between gap-3">
                          <span className="text-[#A6A29A]">
                            {payment.paymentGateway || payment.paymentMethod}
                          </span>
                          <span className="text-[#C6A66B]">
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>

                        <p className="mt-2 text-[#A6A29A]">
                          Status: {capitalize(payment.status)}
                        </p>

                        {payment.transactionId && (
                          <p className="mt-1 break-all text-[#777]">
                            Transaction: {payment.transactionId}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#A6A29A]">
                    No payment records found.
                  </p>
                )}
              </section>

              {/* Update Status */}
              <section>
                <h3 className="mb-3 text-xs uppercase tracking-wider text-[#C6A66B]">
                  Update Order Status
                </h3>

                <div className="mb-3">
                  <span
                    className={`inline-flex items-center gap-2 border px-3 py-2 text-xs ${
                      statusStyles[currentStatus] || ''
                    }`}
                  >
                    {capitalize(currentStatus)}
                  </span>
                </div>

                {availableStatuses.length > 0 ? (
                  <select
                    value=""
                    disabled={updating}
                    onChange={(event) => {
                      if (event.target.value) {
                        updateOrderStatus(event.target.value)
                      }
                    }}
                    className="w-full border border-white/10 bg-[#0B0B0C] px-4 py-3 text-sm text-[#F5F0E6] outline-none focus:border-[#C6A66B]/50 disabled:opacity-50"
                  >
                    <option value="">Select next status</option>

                    {availableStatuses.map((status) => (
                      <option key={status} value={status}>
                        {capitalize(status)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-[#A6A29A]">
                    No further status transitions are available for this order.
                    Cancellation and refunds require separate processing.
                  </p>
                )}

                {updating && (
                  <p className="mt-3 text-xs text-[#C6A66B]">
                    Updating order...
                  </p>
                )}

                {actionMessage && (
                  <p className="mt-3 text-xs text-[#C6A66B]">
                    {actionMessage}
                  </p>
                )}
              </section>
            </div>

            <div className="border-t border-white/10 p-6">
              <button
                onClick={() => {
                  setSelectedOrder(null)
                  setActionMessage('')
                }}
                className="w-full border border-white/10 py-3 text-sm text-[#A6A29A] transition hover:border-[#C6A66B]/40 hover:text-[#F5F0E6]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-[#777]">
        Live order data · Connected to SmartBook backend
      </p>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="border border-[#C6A66B]/20 bg-[#151515] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#A6A29A]">{title}</p>
          <h2 className="mt-2 text-2xl font-semibold">{value}</h2>
          {subtitle && (
            <p className="mt-1 text-xs text-[#777]">{subtitle}</p>
          )}
        </div>

        <div className={`bg-white/5 p-3 ${color}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}
