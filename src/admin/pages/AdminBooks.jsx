
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Package,
  AlertTriangle,
  X,
  RefreshCw,
  Star,
  AlertCircle,
} from 'lucide-react'

import { useAdminAuth } from '../../context/AdminAuthContext'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
).replace(/\/$/, '')

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)

export default function AdminBooks() {
  const { token, adminLogout } = useAdminAuth()

  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const apiRequest = useCallback(async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })

    const result = await response.json()

    if (response.status === 401 || response.status === 403) {
      adminLogout()
      throw new Error('Your admin session expired. Please sign in again.')
    }

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Something went wrong.')
    }

    return result
  }, [token, adminLogout])

  const loadBooks = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [booksResult, categoriesResult] = await Promise.all([
        apiRequest('/api/admin/books'),
        apiRequest('/api/categories'),
      ])

      setBooks(booksResult.data.books || [])
      setCategories(categoriesResult.data || [])
    } catch (err) {
      setError(err.message || 'Unable to load books.')
    } finally {
      setLoading(false)
    }
  }, [apiRequest])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const keyword = search.trim().toLowerCase()

      const matchesSearch =
        !keyword ||
        book.title?.toLowerCase().includes(keyword) ||
        book.author?.toLowerCase().includes(keyword)

      const matchesCategory =
        categoryFilter === 'All' ||
        book.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [books, search, categoryFilter])

  const lowStock = books.filter(
    (book) => Number(book.stockQuantity) < 5
  ).length

  const openAddModal = () => {
    setEditingBook(null)
    setError('')
    setNotice('')
    setShowModal(true)
  }

  const openEditModal = (book) => {
    setEditingBook(book)
    setError('')
    setNotice('')
    setShowModal(true)
  }

  const handleSaveBook = async (bookData) => {
    setSaving(true)
    setError('')
    setNotice('')

    try {
      if (editingBook) {
        await apiRequest(`/api/admin/books/${editingBook.id}`, {
          method: 'PUT',
          body: JSON.stringify(bookData),
        })

        setNotice('Book updated successfully.')
      } else {
        await apiRequest('/api/admin/books', {
          method: 'POST',
          body: JSON.stringify(bookData),
        })

        setNotice('Book added successfully.')
      }

      setShowModal(false)
      setEditingBook(null)
      await loadBooks()
    } catch (err) {
      setError(err.message || 'Unable to save book.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBook = async (book) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${book.title}"?`
    )

    if (!confirmed) return

    setDeletingId(book.id)
    setError('')
    setNotice('')

    try {
      await apiRequest(`/api/admin/books/${book.id}`, {
        method: 'DELETE',
      })

      setNotice('Book removed successfully.')
      await loadBooks()
    } catch (err) {
      setError(err.message || 'Unable to delete book.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#C6A66B]">
            Inventory
          </p>

          <h1 className="mt-2 font-editorial text-3xl text-[#F5F0E6] sm:text-4xl">
            Books Management
          </h1>

          <p className="mt-2 text-sm text-[#A6A29A]">
            Manage your bookstore collection.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadBooks}
            disabled={loading}
            className="flex items-center justify-center gap-2 border border-white/10 px-4 py-3 text-sm text-[#C6A66B] transition hover:border-[#C6A66B]/50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#C6A66B] px-5 py-3 text-sm font-medium text-[#0B0B0C] transition hover:bg-[#D8BC82]"
          >
            <Plus size={18} />
            Add New Book
          </button>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="mb-5 flex items-start gap-3 border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {notice && !error && (
        <div className="mb-5 border border-green-500/20 bg-green-500/5 p-4 text-sm text-green-300">
          {notice}
        </div>
      )}

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Books"
          value={books.length}
          icon={BookOpen}
        />

        <StatCard
          title="Categories"
          value={new Set(books.map((book) => book.category).filter(Boolean)).size}
          icon={Package}
        />

        <StatCard
          title="Low Stock"
          value={lowStock}
          icon={AlertTriangle}
          warning
        />
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-white/10 bg-[#151515] p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#77736C]"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or author..."
            className="w-full rounded-lg border border-white/10 bg-[#0B0B0C] py-3 pl-11 pr-4 text-sm text-[#F5F0E6] outline-none transition placeholder:text-[#77736C] focus:border-[#C6A66B]/50"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="rounded-lg border border-white/10 bg-[#0B0B0C] px-4 py-3 text-sm text-[#A6A29A] outline-none focus:border-[#C6A66B]/50"
        >
          <option value="All">All Categories</option>

          {[...new Set(books.map((book) => book.category).filter(Boolean))]
            .sort()
            .map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
        </select>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#151515]">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-base font-medium text-[#F5F0E6]">
            Book Inventory
          </h2>

          <p className="mt-1 text-xs text-[#A6A29A]">
            Showing {filteredBooks.length} of {books.length} books
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs text-[#77736C]">
                <th className="px-6 py-4 font-medium">Book</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {!loading && filteredBooks.map((book) => (
                <tr key={book.id} className="transition hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[#F5F0E6]">
                      {book.title}
                    </p>
                    <p className="mt-1 text-xs text-[#A6A29A]">
                      {book.author}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#A6A29A]">
                    {book.category || 'Uncategorized'}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#A6A29A]">
                    {formatCurrency(book.price)}
                  </td>

                  <td className="px-6 py-4">
                    {Number(book.reviewCount) > 0 && book.rating !== null ? (
                      <span className="inline-flex items-center gap-1 text-sm text-[#C6A66B]">
                        <Star size={14} fill="currentColor" />
                        {Number(book.rating).toFixed(1)}
                        <span className="text-xs text-[#77736C]">
                          ({book.reviewCount})
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-[#77736C]">
                        No reviews yet
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`text-sm ${
                      Number(book.stockQuantity) < 5
                        ? 'text-red-400'
                        : 'text-[#A6A29A]'
                    }`}>
                      {book.stockQuantity}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(book)}
                        className="rounded-lg p-2 text-[#A6A29A] transition hover:bg-[#C6A66B]/10 hover:text-[#C6A66B]"
                        title="Edit book"
                      >
                        <Edit size={17} />
                      </button>

                      <button
                        onClick={() => handleDeleteBook(book)}
                        disabled={deletingId === book.id}
                        className="rounded-lg p-2 text-[#A6A29A] transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                        title="Delete book"
                      >
                        {deletingId === book.id
                          ? <RefreshCw size={17} className="animate-spin" />
                          : <Trash2 size={17} />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="flex items-center justify-center gap-3 py-16 text-sm text-[#A6A29A]">
              <RefreshCw size={18} className="animate-spin" />
              Loading inventory...
            </div>
          )}

          {!loading && filteredBooks.length === 0 && (
            <div className="py-16 text-center text-sm text-[#A6A29A]">
              No books found.
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <BookModal
          book={editingBook}
          categories={categories}
          saving={saving}
          onClose={() => {
            if (!saving) {
              setShowModal(false)
              setEditingBook(null)
            }
          }}
          onSave={handleSaveBook}
        />
      )}

      <p className="mt-8 text-center text-xs text-[#77736C]">
        Live inventory · Connected to SmartBook database
      </p>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, warning }) {
  return (
    <div className="rounded-xl border border-[#C6A66B]/20 bg-[#151515] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#A6A29A]">{title}</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#F5F0E6]">
            {value}
          </h2>
        </div>

        <div className={`rounded-lg bg-white/5 p-3 ${
          warning ? 'text-red-400' : 'text-[#C6A66B]'
        }`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

function BookModal({ book, categories, onClose, onSave, saving }) {
  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    categoryId: book?.categoryId
      ? String(book.categoryId)
      : '',
    price: book?.price ?? '',
    originalPrice: book?.originalPrice ?? '',
    description: book?.description || '',
    pages: book?.pages ?? '',
    language: book?.language || 'English',
    isbn: book?.isbn || '',
    stockQuantity: book?.stockQuantity ?? 0,
    coverImageUrl: book?.coverImageUrl || '',
  })

  const [formError, setFormError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setFormError('')

    if (!formData.title.trim() || !formData.author.trim()) {
      setFormError('Please enter the book title and author.')
      return
    }

    if (formData.price === '' || Number(formData.price) < 0) {
      setFormError('Enter a valid selling price.')
      return
    }

    const payload = {
      title: formData.title.trim(),
      author: formData.author.trim(),
      categoryId: formData.categoryId
        ? Number(formData.categoryId)
        : null,
      price: Number(formData.price),
      originalPrice: formData.originalPrice === ''
        ? null
        : Number(formData.originalPrice),
      description: formData.description,
      pages: formData.pages === '' ? null : Number(formData.pages),
      language: formData.language.trim() || 'English',
      isbn: formData.isbn.trim() || null,
      stockQuantity: Number(formData.stockQuantity),
      coverImageUrl: formData.coverImageUrl.trim() || null,
    }

    onSave(payload)
  }

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-[#0B0B0C] px-4 py-3 text-sm text-[#F5F0E6] outline-none transition placeholder:text-[#77736C] focus:border-[#C6A66B]/50'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-2xl rounded-xl border border-white/10 bg-[#151515]">

        <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6">
          <div>
            <h2 className="font-editorial text-2xl text-[#F5F0E6]">
              {book ? 'Edit Book' : 'Add New Book'}
            </h2>

            <p className="mt-1 text-xs text-[#A6A29A]">
              Enter the book details below.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-[#A6A29A] transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs text-[#A6A29A]">
                Book Title *
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter book title"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-[#A6A29A]">
                Author *
              </label>
              <input
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Enter author name"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-[#A6A29A]">
                Category
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs text-[#A6A29A]">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="349"
                min="0"
                step="0.01"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-[#A6A29A]">
                Original Price (₹)
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="499"
                min="0"
                step="0.01"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-[#A6A29A]">
                Number of Pages
              </label>
              <input
                type="number"
                name="pages"
                value={formData.pages}
                onChange={handleChange}
                placeholder="320"
                min="0"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-[#A6A29A]">
                Language
              </label>
              <input
                name="language"
                value={formData.language}
                onChange={handleChange}
                placeholder="English"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-[#A6A29A]">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                min="0"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-[#A6A29A]">
                ISBN
              </label>
              <input
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="Book ISBN"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs text-[#A6A29A]">
                Cover Image URL
              </label>
              <input
                name="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={handleChange}
                placeholder="https://example.com/book-cover.jpg"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs text-[#A6A29A]">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write a short description about the book..."
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {formError && (
            <p className="border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-300">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-white/10 px-5 py-3 text-sm text-[#A6A29A] transition hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#C6A66B] px-6 py-3 text-sm font-medium text-[#0B0B0C] transition hover:bg-[#D8BC82] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? 'Saving...'
                : book
                  ? 'Save Changes'
                  : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
