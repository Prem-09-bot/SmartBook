
import { useCallback, useEffect, useState } from 'react'
import {
  Search,
  Eye,
  X,
  Users,
  ShoppingBag,
  IndianRupee,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'

const API_URL = '/api/admin/customers'
const PAGE_SIZE = 10

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0)

const formatDate = (date, options = {}) => {
  if (!date) return 'Not available'

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return 'Not available'

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export default function AdminCustomers() {
  const { token, adminLogout } = useAdminAuth()

  const [customers, setCustomers] = useState([])
  const [statistics, setStatistics] = useState({
    totalCustomers: 0,
    orderingCustomers: 0,
    totalOrders: 0,
    totalSpent: 0,
  })

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  })

  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchCustomers = useCallback(async (isRefresh = false) => {
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
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      })

      if (search.trim()) {
        params.set('search', search.trim())
      }

      const response = await fetch(`${API_URL}?${params.toString()}`, {
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
        throw new Error(result.message || 'Unable to load customers.')
      }

      setCustomers(result.data.customers || [])
      setStatistics(result.data.statistics || {})
      setPagination(result.data.pagination || {
        page: 1,
        limit: PAGE_SIZE,
        total: 0,
        totalPages: 0,
      })
    } catch (err) {
      setError(err.message || 'Something went wrong while loading customers.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token, page, search, adminLogout])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers()
    }, 300)

    return () => clearTimeout(timer)
  }, [fetchCustomers])

  const statCards = [
    {
      title: 'Total Customers',
      value: statistics.totalCustomers || 0,
      icon: Users,
      color: 'text-[#C6A66B]',
      description: 'Registered customer accounts',
    },
    {
      title: 'Ordering Customers',
      value: statistics.orderingCustomers || 0,
      icon: UserCheck,
      color: 'text-green-400',
      description: 'Customers who placed orders',
    },
    {
      title: 'Total Orders',
      value: statistics.totalOrders || 0,
      icon: ShoppingBag,
      color: 'text-blue-400',
      description: 'Orders placed by customers',
    },
    {
      title: 'Total Customer Spending',
      value: formatCurrency(statistics.totalSpent),
      icon: IndianRupee,
      color: 'text-[#C6A66B]',
      description: 'Revenue from paid customer orders',
    },
  ]

  const closeModal = () => setSelectedCustomer(null)

  return (
    <div className="min-h-screen bg-[#0B0B0C] px-4 py-8 text-[#F5F0E6] sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#C6A66B]">
            User Management
          </p>

          <h1 className="font-editorial text-3xl sm:text-4xl">
            Customers
          </h1>

          <p className="mt-2 text-sm text-[#A6A29A]">
            Manage customer profiles and monitor their activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchCustomers(true)}
          disabled={loading || refreshing}
          className="flex items-center justify-center gap-2 border border-white/10 bg-[#151515] px-4 py-3 text-sm text-[#C6A66B] transition hover:border-[#C6A66B]/40 disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={refreshing ? 'animate-spin' : ''}
          />
          {refreshing ? 'Refreshing...' : 'Refresh'}
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
            onClick={() => fetchCustomers(true)}
            className="shrink-0 text-sm text-[#C6A66B]"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="border border-[#C6A66B]/20 bg-[#151515] p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-[#A6A29A]">{stat.title}</p>

                <h2 className="mt-2 break-words text-2xl font-semibold">
                  {loading && !customers.length ? '—' : stat.value}
                </h2>
              </div>

              <div className={`shrink-0 bg-white/5 p-3 ${stat.color}`}>
                <stat.icon size={22} />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#77736C]">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 border border-white/10 bg-[#151515] px-4 py-3 sm:w-96">
          <Search size={18} className="shrink-0 text-[#A6A29A]" />

          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search name, email, or ID..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#777]"
          />

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setPage(1)
              }}
              className="text-[#A6A29A] hover:text-white"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <p className="text-xs text-[#A6A29A]">
          {pagination.total} registered customers
        </p>
      </div>

      {/* Customers Table */}
      <div className="overflow-hidden border border-white/10 bg-[#151515]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-editorial text-xl">All Customers</h2>

          <span className="text-xs text-[#A6A29A]">
            {pagination.total} results
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="border-b border-white/10 bg-[#0B0B0C]">
              <tr className="text-xs uppercase tracking-wider text-[#A6A29A]">
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Customer ID</th>
                <th className="px-5 py-4 font-medium">Joined</th>
                <th className="px-5 py-4 font-medium">Orders</th>
                <th className="px-5 py-4 font-medium">Total Spent</th>
                <th className="px-5 py-4 font-medium">Activity</th>
                <th className="px-5 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-sm text-[#A6A29A]"
                  >
                    Loading customer records...
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#C6A66B]/20 bg-[#C6A66B]/10 text-sm font-semibold text-[#C6A66B]">
                          {customer.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {customer.name}
                          </p>

                          <p className="mt-1 truncate text-xs text-[#777]">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs text-[#C6A66B]">
                      #{customer.id}
                    </td>

                    <td className="px-5 py-4 text-sm text-[#A6A29A]">
                      {formatDate(customer.joined)}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {customer.orders}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium">
                      {formatCurrency(customer.spent)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`border px-2.5 py-1 text-xs ${
                          customer.orders > 0
                            ? 'border-green-500/20 bg-green-500/10 text-green-400'
                            : 'border-white/10 bg-white/5 text-[#A6A29A]'
                        }`}
                      >
                        {customer.orders > 0 ? 'Has Orders' : 'No Orders'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(customer)}
                        className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-xs text-[#A6A29A] transition hover:border-[#C6A66B]/40 hover:text-[#C6A66B]"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-16 text-center text-sm text-[#A6A29A]"
                  >
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col justify-between gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-xs text-[#77736C]">
            Showing {customers.length ? (page - 1) * PAGE_SIZE + 1 : 0}
            {'–'}
            {(page - 1) * PAGE_SIZE + customers.length}
            {' of '}
            {pagination.total} customers
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="flex items-center gap-1 border border-white/10 px-3 py-2 text-xs text-[#A6A29A] transition hover:border-[#C6A66B]/40 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={15} />
              Previous
            </button>

            <span className="text-xs text-[#A6A29A]">
              {pagination.totalPages ? page : 0} / {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
              className="flex items-center gap-1 border border-white/10 px-3 py-2 text-xs text-[#A6A29A] transition hover:border-[#C6A66B]/40 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="my-8 w-full max-w-xl border border-[#C6A66B]/20 bg-[#151515]"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#C6A66B]">
                  Customer Profile
                </p>

                <h2 className="mt-2 font-editorial text-2xl">
                  {selectedCustomer.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="text-[#A6A29A] transition hover:text-white"
                aria-label="Close customer profile"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Customer Info */}
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#C6A66B]/30 bg-[#C6A66B]/10 font-editorial text-2xl text-[#C6A66B]">
                  {selectedCustomer.name?.charAt(0)?.toUpperCase() || '?'}
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-medium">
                    {selectedCustomer.name}
                  </h3>

                  <p className="mt-1 text-xs text-[#A6A29A]">
                    Customer ID: #{selectedCustomer.id}
                  </p>

                  <span
                    className={`mt-2 inline-block border px-2 py-0.5 text-xs ${
                      selectedCustomer.orders > 0
                        ? 'border-green-500/20 bg-green-500/10 text-green-400'
                        : 'border-white/10 bg-white/5 text-[#A6A29A]'
                    }`}
                  >
                    {selectedCustomer.orders > 0 ? 'Has Orders' : 'No Orders'}
                  </span>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-4 border-y border-white/10 py-5">
                <InfoRow
                  icon={Mail}
                  label="Email Address"
                  value={selectedCustomer.email}
                />

                <InfoRow
                  icon={Phone}
                  label="Phone Number"
                  value={selectedCustomer.phone || 'Not provided'}
                />

                <InfoRow
                  icon={MapPin}
                  label="Location"
                  value={selectedCustomer.location || 'Not provided'}
                />

                <InfoRow
                  icon={CalendarDays}
                  label="Registration Date"
                  value={formatDate(selectedCustomer.joined, {
                    month: 'long',
                  })}
                />
              </div>

              {/* Activity Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-white/10 bg-[#0B0B0C] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#A6A29A]">
                    <ShoppingBag size={16} />
                    <span className="text-xs">Total Orders</span>
                  </div>

                  <p className="text-2xl font-semibold">
                    {selectedCustomer.orders}
                  </p>
                </div>

                <div className="border border-white/10 bg-[#0B0B0C] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#A6A29A]">
                    <IndianRupee size={16} />
                    <span className="text-xs">Total Spent</span>
                  </div>

                  <p className="text-2xl font-semibold text-[#C6A66B]">
                    {formatCurrency(selectedCustomer.spent)}
                  </p>
                </div>
              </div>

              <p className="text-center text-xs text-[#777]">
                Customer information retrieved from the SmartBook database.
              </p>
            </div>

            <div className="border-t border-white/10 p-6">
              <button
                type="button"
                onClick={closeModal}
                className="w-full border border-white/10 py-3 text-sm text-[#A6A29A] transition hover:border-[#C6A66B]/40 hover:text-[#F5F0E6]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-[#777]">
        SmartBook Admin Panel · Live Customer Records
      </p>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-[#C6A66B]" />

      <div className="min-w-0">
        <p className="text-xs text-[#777]">{label}</p>
        <p className="mt-1 break-words text-sm text-[#F5F0E6]">{value}</p>
      </div>
    </div>
  )
}
