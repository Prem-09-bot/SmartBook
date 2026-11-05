
import { useCallback, useEffect, useState } from 'react'
import {
  Search,
  Eye,
  X,
  Star,
  MessageSquare,
  CheckCircle,
  EyeOff,
  Trash2,
  Clock,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ''
).replace(/\/$/, '')

const PAGE_SIZE = 10

const statusStyles = {
  approved: 'border-green-500/20 bg-green-500/10 text-green-400',
  pending: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
  rejected: 'border-gray-500/20 bg-gray-500/10 text-gray-400',
}

const statusLabels = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Hidden',
}

const formatDate = (date, long = false) => {
  if (!date) return 'Not available'

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'Not available'

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: long ? 'long' : 'short',
    year: 'numeric',
  })
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="border border-[#C6A66B]/20 bg-[#151515] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#A6A29A]">{title}</p>
          <h2 className="mt-2 text-2xl font-semibold">{value}</h2>
        </div>
        <div className={`bg-white/5 p-3 ${color}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

export default function AdminReviews() {
  const { token, adminLogout } = useAdminAuth()

  const [reviews, setReviews] = useState([])
  const [statistics, setStatistics] = useState({
    totalReviews: 0,
    averageRating: 0,
    approvedReviews: 0,
    pendingReviews: 0,
    rejectedReviews: 0,
  })

  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)

  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  })

  const [selectedReview, setSelectedReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const fetchReviews = useCallback(async (refresh = false) => {
    if (!token) {
      setLoading(false)
      setError('Admin token is missing. Please sign in again.')
      return
    }

    if (refresh) setRefreshing(true)
    else setLoading(true)

    setError('')
    setNotice('')

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      })

      if (search.trim()) params.set('search', search.trim())
      if (ratingFilter !== 'All') params.set('rating', ratingFilter)

      const backendStatus = {
        All: '',
        Pending: 'pending',
        Approved: 'approved',
        Hidden: 'rejected',
      }[statusFilter]

      if (backendStatus) params.set('status', backendStatus)

      const response = await fetch(
        `${API_BASE_URL}/api/admin/reviews?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const result = await response.json()

      if (response.status === 401 || response.status === 403) {
        adminLogout()
        throw new Error('Your admin session has expired. Please sign in again.')
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to load reviews.')
      }

      setReviews(result.data.reviews || [])
      setStatistics(result.data.statistics || {})
      setPagination(result.data.pagination || {
        page: 1,
        total: 0,
        totalPages: 0,
      })
    } catch (err) {
      setError(err.message || 'Unable to load reviews.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token, adminLogout, page, search, ratingFilter, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => fetchReviews(), 300)
    return () => clearTimeout(timer)
  }, [fetchReviews])

  const changeFilter = (setter, value) => {
    setter(value)
    setPage(1)
    setSelectedReview(null)
  }

  const updateReviewStatus = async (review, newStatus) => {
    if (actionLoading) return

    setActionLoading(true)
    setError('')
    setNotice('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/reviews/${review.id}/status`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      )

      const result = await response.json()

      if (response.status === 401 || response.status === 403) {
        adminLogout()
        throw new Error('Your admin session has expired. Please sign in again.')
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to update review.')
      }

      setSelectedReview((current) =>
        current?.id === review.id
          ? { ...current, status: newStatus }
          : current
      )

      setNotice('Review status updated successfully.')
      await fetchReviews(true)
    } catch (err) {
      setError(err.message || 'Unable to update review.')
    } finally {
      setActionLoading(false)
    }
  }

  const deleteReview = async (review) => {
    if (actionLoading) return

    const confirmed = window.confirm(
      `Permanently delete the review by ${review.customer}? This cannot be undone.`
    )

    if (!confirmed) return

    setActionLoading(true)
    setError('')
    setNotice('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/reviews/${review.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const result = await response.json()

      if (response.status === 401 || response.status === 403) {
        adminLogout()
        throw new Error('Your admin session has expired. Please sign in again.')
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to delete review.')
      }

      setSelectedReview(null)
      setNotice('Review permanently deleted.')
      await fetchReviews(true)
    } catch (err) {
      setError(err.message || 'Unable to delete review.')
    } finally {
      setActionLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Reviews',
      value: statistics.totalReviews,
      icon: MessageSquare,
      color: 'text-[#C6A66B]',
    },
    {
      title: 'Average Rating',
      value: `${Number(statistics.averageRating || 0).toFixed(1)} / 5`,
      icon: Star,
      color: 'text-yellow-400',
    },
    {
      title: 'Approved Reviews',
      value: statistics.approvedReviews,
      icon: CheckCircle,
      color: 'text-green-400',
    },
    {
      title: 'Pending Reviews',
      value: statistics.pendingReviews,
      icon: Clock,
      color: 'text-orange-400',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0B0B0C] px-4 py-8 text-[#F5F0E6] sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#C6A66B]">
            Customer Feedback
          </p>

          <h1 className="font-editorial text-3xl sm:text-4xl">
            Reviews
          </h1>

          <p className="mt-2 text-sm text-[#A6A29A]">
            Manage customer reviews, ratings, and moderation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchReviews(true)}
          disabled={loading || refreshing}
          className="flex items-center justify-center gap-2 border border-white/10 px-4 py-3 text-sm text-[#C6A66B] transition hover:border-[#C6A66B]/40 disabled:opacity-50"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Feedback */}
      {error && (
        <div className="mb-5 flex items-center gap-2 border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {notice && (
        <div className="mb-5 border border-green-400/20 bg-green-400/5 p-4 text-sm text-green-300">
          {notice}
        </div>
      )}

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Search */}
      <div className="mb-6 flex items-center gap-3 border border-white/10 bg-[#151515] px-4 py-3 lg:max-w-md">
        <Search size={18} className="shrink-0 text-[#A6A29A]" />

        <input
          type="text"
          value={search}
          onChange={(event) => changeFilter(setSearch, event.target.value)}
          placeholder="Search customer, book, or review..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-[#777]"
        />

        {search && (
          <button
            type="button"
            onClick={() => changeFilter(setSearch, '')}
            className="text-[#A6A29A] hover:text-white"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="pr-2 text-xs text-[#A6A29A]">Rating:</span>

          {['All', '5', '4', '3', '2', '1'].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => changeFilter(setRatingFilter, rating)}
              className={`flex items-center gap-1 border px-3 py-2 text-xs transition ${
                ratingFilter === rating
                  ? 'border-[#C6A66B] bg-[#C6A66B] text-black'
                  : 'border-white/10 text-[#A6A29A] hover:border-[#C6A66B]/40'
              }`}
            >
              {rating !== 'All' && <Star size={12} />}
              {rating === 'All' ? 'All' : `${rating} Stars`}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 sm:ml-auto">
          {['All', 'Pending', 'Approved', 'Hidden'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => changeFilter(setStatusFilter, status)}
              className={`border px-3 py-2 text-xs transition ${
                statusFilter === status
                  ? 'border-[#C6A66B] bg-[#C6A66B] text-black'
                  : 'border-white/10 text-[#A6A29A] hover:border-[#C6A66B]/40'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      <div className="overflow-hidden border border-white/10 bg-[#151515]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-editorial text-xl">All Reviews</h2>
          <span className="text-xs text-[#A6A29A]">
            {pagination.total} results
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="border-b border-white/10 bg-[#0B0B0C]">
              <tr className="text-xs uppercase tracking-wider text-[#A6A29A]">
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Book</th>
                <th className="px-5 py-4 font-medium">Rating</th>
                <th className="px-5 py-4 font-medium">Date</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-sm text-[#A6A29A]">
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <tr key={review.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium">{review.customer}</p>
                      <p className="mt-1 text-xs text-[#777]">{review.email}</p>
                    </td>

                    <td className="px-5 py-4 text-sm">{review.book}</td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-yellow-400">
                        {review.rating}
                        <Star size={13} fill="currentColor" />
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-[#A6A29A]">
                      {formatDate(review.date)}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`border px-2.5 py-1 text-xs ${statusStyles[review.status] || statusStyles.pending}`}>
                        {statusLabels[review.status] || review.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedReview(review)}
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
                  <td colSpan="6" className="px-5 py-16 text-center text-sm text-[#A6A29A]">
                    {search || ratingFilter !== 'All' || statusFilter !== 'All'
                      ? 'No reviews match your filters.'
                      : 'No customer reviews have been submitted yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col justify-between gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-xs text-[#77736C]">
            Showing {reviews.length ? (page - 1) * PAGE_SIZE + 1 : 0}
            {'–'}
            {(page - 1) * PAGE_SIZE + reviews.length}
            {' of '}
            {pagination.total} reviews
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="flex items-center gap-1 border border-white/10 px-3 py-2 text-xs text-[#A6A29A] disabled:opacity-30"
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
              className="flex items-center gap-1 border border-white/10 px-3 py-2 text-xs text-[#A6A29A] disabled:opacity-30"
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Review Details Modal */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="my-8 w-full max-w-xl border border-[#C6A66B]/20 bg-[#151515]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#C6A66B]">
                  Review Details
                </p>
                <h2 className="mt-2 font-editorial text-2xl">
                  Customer Review
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="text-[#A6A29A] hover:text-white"
                aria-label="Close review details"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <p className="text-xs text-[#777]">Customer</p>
                <p className="mt-1 text-sm font-medium">{selectedReview.customer}</p>
                <p className="mt-1 text-xs text-[#A6A29A]">{selectedReview.email}</p>
              </div>

              <div>
                <p className="text-xs text-[#777]">Book</p>
                <p className="mt-1 text-sm font-medium">{selectedReview.book}</p>
                {selectedReview.author && (
                  <p className="mt-1 text-xs text-[#A6A29A]">{selectedReview.author}</p>
                )}
              </div>

              <div>
                <p className="mb-2 text-xs text-[#777]">Rating</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      className={star <= selectedReview.rating ? 'text-yellow-400' : 'text-gray-600'}
                      fill={star <= selectedReview.rating ? 'currentColor' : 'none'}
                    />
                  ))}
                  <span className="ml-2 text-sm text-[#A6A29A]">
                    {selectedReview.rating}/5
                  </span>
                </div>
              </div>

              {selectedReview.title && (
                <div>
                  <p className="mb-2 text-xs text-[#777]">Review Title</p>
                  <p className="text-sm font-medium">{selectedReview.title}</p>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs text-[#777]">Review</p>
                <div className="border border-white/10 bg-[#0B0B0C] p-4">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-[#A6A29A]">
                    {selectedReview.review || 'No written comment provided.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <p className="text-xs text-[#777]">Submitted on</p>
                  <p className="mt-1 text-sm">
                    {formatDate(selectedReview.date, true)}
                  </p>
                </div>

                <span className={`border px-2.5 py-1 text-xs ${statusStyles[selectedReview.status] || statusStyles.pending}`}>
                  {statusLabels[selectedReview.status] || selectedReview.status}
                </span>
              </div>

              {/* Moderation */}
              <div>
                <p className="mb-3 text-xs uppercase tracking-wider text-[#C6A66B]">
                  Moderation
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {selectedReview.status !== 'approved' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => updateReviewStatus(selectedReview, 'approved')}
                      className="flex items-center justify-center gap-2 border border-green-500/20 py-3 text-sm text-green-400 transition hover:bg-green-500/10 disabled:opacity-50"
                    >
                      <CheckCircle size={16} />
                      Approve Review
                    </button>
                  )}

                  {selectedReview.status !== 'rejected' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => updateReviewStatus(selectedReview, 'rejected')}
                      className="flex items-center justify-center gap-2 border border-yellow-500/20 py-3 text-sm text-yellow-400 transition hover:bg-yellow-500/10 disabled:opacity-50"
                    >
                      <EyeOff size={16} />
                      Hide Review
                    </button>
                  )}

                  {selectedReview.status === 'rejected' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => updateReviewStatus(selectedReview, 'pending')}
                      className="flex items-center justify-center gap-2 border border-blue-500/20 py-3 text-sm text-blue-400 transition hover:bg-blue-500/10 disabled:opacity-50"
                    >
                      <Clock size={16} />
                      Restore to Pending
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => deleteReview(selectedReview)}
                    className="flex items-center justify-center gap-2 border border-red-500/20 py-3 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Delete Review
                  </button>
                </div>

                {actionLoading && (
                  <p className="mt-3 text-center text-xs text-[#A6A29A]">
                    Saving changes...
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-white/10 p-6">
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="w-full border border-white/10 py-3 text-sm text-[#A6A29A] transition hover:border-[#C6A66B]/40 hover:text-[#F5F0E6]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-[#777]">
        SmartBook Admin Panel · Live Review Records
      </p>
    </div>
  )
}
