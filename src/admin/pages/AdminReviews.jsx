import { useState } from 'react'
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
} from 'lucide-react'

const initialReviews = [
  {
    id: 1,
    customer: 'Rahul Sharma',
    email: 'rahul@example.com',
    book: 'The Silent Patient',
    rating: 5,
    review:
      'Absolutely brilliant! The plot twist was unexpected and kept me hooked until the very end. A must-read for thriller lovers.',
    date: '2026-10-18',
    status: 'Approved',
  },
  {
    id: 2,
    customer: 'Priya Das',
    email: 'priya@example.com',
    book: 'Atomic Habits',
    rating: 4,
    review:
      'A wonderful book about building good habits. Very practical and easy to understand. Highly recommended.',
    date: '2026-10-17',
    status: 'Pending',
  },
  {
    id: 3,
    customer: 'Amit Roy',
    email: 'amit@example.com',
    book: 'The Psychology of Money',
    rating: 5,
    review:
      'This book completely changed my perspective on money and investing. Morgan Housel explains everything beautifully.',
    date: '2026-10-16',
    status: 'Approved',
  },
  {
    id: 4,
    customer: 'Sneha Gupta',
    email: 'sneha@example.com',
    book: 'Ikigai',
    rating: 3,
    review:
      'An interesting read with some useful life lessons. However, I found certain parts repetitive.',
    date: '2026-10-15',
    status: 'Pending',
  },
  {
    id: 5,
    customer: 'Arjun Sen',
    email: 'arjun@example.com',
    book: 'Deep Work',
    rating: 4,
    review:
      'Great insights on productivity and focus. Definitely worth reading for students and professionals.',
    date: '2026-10-14',
    status: 'Hidden',
  },
  {
    id: 6,
    customer: 'Meera Banerjee',
    email: 'meera@example.com',
    book: 'The Alchemist',
    rating: 5,
    review:
      'A beautiful and inspiring story about following your dreams. One of my all-time favorite books.',
    date: '2026-10-13',
    status: 'Approved',
  },
  {
    id: 7,
    customer: 'Riya Mukherjee',
    email: 'riya@example.com',
    book: 'Rich Dad Poor Dad',
    rating: 2,
    review:
      'Some interesting ideas, but the content felt repetitive and overly simplistic.',
    date: '2026-10-12',
    status: 'Pending',
  },
]

const statusStyles = {
  Approved: 'border-green-500/20 bg-green-500/10 text-green-400',
  Pending: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
  Hidden: 'border-gray-500/20 bg-gray-500/10 text-gray-400',
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState(initialReviews)
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedReview, setSelectedReview] = useState(null)

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.customer.toLowerCase().includes(search.toLowerCase()) ||
      review.book.toLowerCase().includes(search.toLowerCase()) ||
      review.review.toLowerCase().includes(search.toLowerCase())

    const matchesRating =
      ratingFilter === 'All' || review.rating === Number(ratingFilter)

    const matchesStatus =
      statusFilter === 'All' || review.status === statusFilter

    return matchesSearch && matchesRating && matchesStatus
  })

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : '0.0'

  const pendingCount = reviews.filter(
    (review) => review.status === 'Pending'
  ).length

  const approvedCount = reviews.filter(
    (review) => review.status === 'Approved'
  ).length

  const updateReviewStatus = (id, newStatus) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === id ? { ...review, status: newStatus } : review
      )
    )

    setSelectedReview((prev) =>
      prev && prev.id === id ? { ...prev, status: newStatus } : prev
    )
  }

  const deleteReview = (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      setReviews((prev) => prev.filter((review) => review.id !== id))
      setSelectedReview(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] px-4 py-8 text-[#F5F0E6] sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8">
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

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Reviews"
          value={reviews.length}
          icon={MessageSquare}
          color="text-[#C6A66B]"
        />

        <StatCard
          title="Average Rating"
          value={`${averageRating} / 5`}
          icon={Star}
          color="text-yellow-400"
        />

        <StatCard
          title="Approved Reviews"
          value={approvedCount}
          icon={CheckCircle}
          color="text-green-400"
        />

        <StatCard
          title="Pending Reviews"
          value={pendingCount}
          icon={Clock}
          color="text-orange-400"
        />

      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col gap-4">

        <div className="flex items-center gap-3 border border-white/10 bg-[#151515] px-4 py-3 lg:max-w-md">
          <Search size={18} className="text-[#A6A29A]" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, book, or review..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#777]"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">

          {/* Rating Filter */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center pr-2 text-xs text-[#A6A29A]">
              Rating:
            </span>

            {['All', '5', '4', '3', '2', '1'].map((rating) => (
              <button
                key={rating}
                onClick={() => setRatingFilter(rating)}
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

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            {['All', 'Pending', 'Approved', 'Hidden'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
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
      </div>

      {/* Reviews Table */}
      <div className="overflow-hidden border border-white/10 bg-[#151515]">

        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-editorial text-xl">
            All Reviews
          </h2>

          <span className="text-xs text-[#A6A29A]">
            {filteredReviews.length} results
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
              {filteredReviews.map((review) => (
                <tr
                  key={review.id}
                  className="transition hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium">{review.customer}</p>
                    <p className="mt-1 text-xs text-[#777]">
                      {review.email}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm">{review.book}</td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-yellow-400">
                      {review.rating}
                      <Star size={13} fill="currentColor" />
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-[#A6A29A]">
                    {new Date(review.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`border px-2.5 py-1 text-xs ${statusStyles[review.status]}`}
                    >
                      {review.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-xs text-[#A6A29A] transition hover:border-[#C6A66B]/40 hover:text-[#C6A66B]"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

          {filteredReviews.length === 0 && (
            <div className="py-16 text-center text-sm text-[#A6A29A]">
              No reviews found.
            </div>
          )}
        </div>
      </div>

      {/* Review Details Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">

          <div className="my-8 w-full max-w-xl border border-[#C6A66B]/20 bg-[#151515]">

            {/* Modal Header */}
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
                onClick={() => setSelectedReview(null)}
                className="text-[#A6A29A] transition hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-6 p-6">

              {/* Customer */}
              <div>
                <p className="text-xs text-[#777]">Customer</p>
                <p className="mt-1 text-sm font-medium">
                  {selectedReview.customer}
                </p>
                <p className="mt-1 text-xs text-[#A6A29A]">
                  {selectedReview.email}
                </p>
              </div>

              {/* Book */}
              <div>
                <p className="text-xs text-[#777]">Book</p>
                <p className="mt-1 text-sm font-medium">
                  {selectedReview.book}
                </p>
              </div>

              {/* Rating */}
              <div>
                <p className="mb-2 text-xs text-[#777]">Rating</p>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      className={
                        star <= selectedReview.rating
                          ? 'text-yellow-400'
                          : 'text-gray-600'
                      }
                      fill={
                        star <= selectedReview.rating
                          ? 'currentColor'
                          : 'none'
                      }
                    />
                  ))}

                  <span className="ml-2 text-sm text-[#A6A29A]">
                    {selectedReview.rating}/5
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <p className="mb-2 text-xs text-[#777]">Review</p>

                <div className="border border-white/10 bg-[#0B0B0C] p-4">
                  <p className="text-sm leading-7 text-[#A6A29A]">
                    {selectedReview.review}
                  </p>
                </div>
              </div>

              {/* Date & Status */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <p className="text-xs text-[#777]">Submitted on</p>
                  <p className="mt-1 text-sm">
                    {new Date(selectedReview.date).toLocaleDateString(
                      'en-IN',
                      {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      }
                    )}
                  </p>
                </div>

                <span
                  className={`border px-2.5 py-1 text-xs ${statusStyles[selectedReview.status]}`}
                >
                  {selectedReview.status}
                </span>
              </div>

              {/* Moderation Actions */}
              <div>
                <p className="mb-3 text-xs uppercase tracking-wider text-[#C6A66B]">
                  Moderation
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  {selectedReview.status !== 'Approved' && (
                    <button
                      onClick={() =>
                        updateReviewStatus(selectedReview.id, 'Approved')
                      }
                      className="flex items-center justify-center gap-2 border border-green-500/20 py-3 text-sm text-green-400 transition hover:bg-green-500/10"
                    >
                      <CheckCircle size={16} />
                      Approve Review
                    </button>
                  )}

                  {selectedReview.status !== 'Hidden' && (
                    <button
                      onClick={() =>
                        updateReviewStatus(selectedReview.id, 'Hidden')
                      }
                      className="flex items-center justify-center gap-2 border border-yellow-500/20 py-3 text-sm text-yellow-400 transition hover:bg-yellow-500/10"
                    >
                      <EyeOff size={16} />
                      Hide Review
                    </button>
                  )}

                  {selectedReview.status === 'Hidden' && (
                    <button
                      onClick={() =>
                        updateReviewStatus(selectedReview.id, 'Pending')
                      }
                      className="flex items-center justify-center gap-2 border border-blue-500/20 py-3 text-sm text-blue-400 transition hover:bg-blue-500/10"
                    >
                      <Clock size={16} />
                      Restore Review
                    </button>
                  )}

                  <button
                    onClick={() => deleteReview(selectedReview.id)}
                    className="flex items-center justify-center gap-2 border border-red-500/20 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                    Delete Review
                  </button>

                </div>
              </div>

            </div>

            <div className="border-t border-white/10 p-6">
              <button
                onClick={() => setSelectedReview(null)}
                className="w-full border border-white/10 py-3 text-sm text-[#A6A29A] transition hover:border-[#C6A66B]/40 hover:text-[#F5F0E6]"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Demo Notice */}
      <p className="mt-8 text-center text-xs text-[#777]">
        Demo mode — review data is simulated and resets on refresh.
      </p>

    </div>
  )
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
