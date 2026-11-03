import { useState } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Package,
  AlertTriangle,
  X,
} from 'lucide-react'

import { books as initialBooks } from '../../data/books'

export default function AdminBooks() {
  const [books, setBooks] = useState(initialBooks)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingBook, setEditingBook] = useState(null)

  const categories = [
    'All',
    ...new Set(books.map((book) => book.category)),
  ]

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      categoryFilter === 'All' || book.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const openAddModal = () => {
    setEditingBook(null)
    setShowModal(true)
  }

  const openEditModal = (book) => {
    setEditingBook(book)
    setShowModal(true)
  }

  const handleSaveBook = (bookData) => {
    if (editingBook) {
      setBooks((prev) =>
        prev.map((book) =>
          book.id === editingBook.id
            ? { ...book, ...bookData }
            : book,
        ),
      )
    } else {
      const newBook = {
        ...bookData,
        id: `book-${Date.now()}`,
        rating: 0,
        reviews: 0,
        badge: '',
        coverColor: '#293b36',
        coverAccent: '#c4a66a',
        coverText: bookData.title.toUpperCase(),
      }

      setBooks((prev) => [newBook, ...prev])
    }

    setShowModal(false)
    setEditingBook(null)
  }

  const handleDeleteBook = (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this book?',
    )

    if (confirmed) {
      setBooks((prev) => prev.filter((book) => book.id !== id))
    }
  }

  const totalInventory = books.length

  const lowStock = books.filter(
    (book) => (book.stock ?? 10) < 5,
  ).length

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

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#C6A66B] px-5 py-3 text-sm font-medium text-[#0B0B0C] transition hover:bg-[#D8BC82]"
        >
          <Plus size={18} />
          Add New Book
        </button>
      </div>

      {/* Demo Notice */}
      <div className="mb-6 rounded-lg border border-[#C6A66B]/20 bg-[#C6A66B]/5 px-4 py-3 text-xs text-[#A6A29A]">
        Demo mode: Changes are temporary and will reset when you refresh.
      </div>

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Books"
          value={totalInventory}
          icon={BookOpen}
        />

        <StatCard
          title="Categories"
          value={categories.length - 1}
          icon={Package}
        />

        <StatCard
          title="Low Stock"
          value={lowStock}
          icon={AlertTriangle}
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or author..."
            className="w-full rounded-lg border border-white/10 bg-[#0B0B0C] py-3 pl-11 pr-4 text-sm text-[#F5F0E6] outline-none transition placeholder:text-[#77736C] focus:border-[#C6A66B]/50"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#0B0B0C] px-4 py-3 text-sm text-[#A6A29A] outline-none focus:border-[#C6A66B]/50"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === 'All' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Books Table */}
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
          <table className="w-full min-w-[750px] text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs text-[#77736C]">
                <th className="px-6 py-4 font-medium">Book</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBooks.map((book) => (
                <tr
                  key={book.id}
                  className="border-b border-white/5 transition hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* Book Cover */}
                      <div
                        className="flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded-sm shadow-lg"
                        style={{
                          backgroundColor: book.coverColor || '#293b36',
                          borderLeft: `3px solid ${book.coverAccent || '#C6A66B'}`,
                        }}
                      >
                        <span
                          className="px-1 text-center text-[7px] font-bold leading-tight"
                          style={{
                            color: book.coverAccent || '#C6A66B',
                          }}
                        >
                          {book.coverText || book.title}
                        </span>
                      </div>

                      <div>
                        <p className="max-w-[200px] truncate text-sm font-medium text-[#F5F0E6]">
                          {book.title}
                        </p>

                        <p className="mt-1 text-xs text-[#77736C]">
                          {book.author}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#A6A29A]">
                      {book.category}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#C6A66B]">
                    ₹{book.price}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#A6A29A]">
                    ⭐ {book.rating || '—'}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(book)}
                        className="rounded-lg p-2 text-[#A6A29A] transition hover:bg-[#C6A66B]/10 hover:text-[#C6A66B]"
                        title="Edit book"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="rounded-lg p-2 text-[#A6A29A] transition hover:bg-red-500/10 hover:text-red-400"
                        title="Delete book"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {filteredBooks.length === 0 && (
            <div className="py-16 text-center">
              <BookOpen
                size={36}
                className="mx-auto text-[#77736C]"
              />

              <p className="mt-4 text-sm text-[#A6A29A]">
                No books found.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <BookModal
          book={editingBook}
          onClose={() => setShowModal(false)}
          onSave={handleSaveBook}
        />
      )}
    </div>
  )
}

// =============================
// STAT CARD
// =============================
function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#151515] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#A6A29A]">{title}</p>

        <Icon size={18} className="text-[#C6A66B]" />
      </div>

      <h3 className="mt-4 text-2xl font-semibold text-[#F5F0E6]">
        {value}
      </h3>
    </div>
  )
}

// =============================
// BOOK MODAL
// =============================
function BookModal({ book, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    category: book?.category || 'Fiction',
    price: book?.price || '',
    originalPrice: book?.originalPrice || '',
    description: book?.description || '',
    pages: book?.pages || '',
    language: book?.language || 'English',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.author.trim()) {
      alert('Please enter the book title and author.')
      return
    }

    onSave({
      ...formData,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice || formData.price),
      pages: Number(formData.pages || 0),
    })
  }

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-[#0B0B0C] px-4 py-3 text-sm text-[#F5F0E6] outline-none transition placeholder:text-[#77736C] focus:border-[#C6A66B]/50'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-2xl rounded-xl border border-white/10 bg-[#151515]">
        {/* Modal Header */}
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
            className="rounded-lg p-2 text-[#A6A29A] transition hover:bg-white/5 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Title */}
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

            {/* Author */}
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

            {/* Category */}
            <div>
              <label className="mb-2 block text-xs text-[#A6A29A]">
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={inputClass}
              >
                {[
                  'Fiction',
                  'Non-Fiction',
                  'Thriller',
                  'Self-Help',
                  'Business',
                  'Biography',
                  'Fantasy',
                  'Romance',
                  'Science',
                  'Philosophy',
                  'Mystery',
                  'Other',
                ].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
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
                className={inputClass}
                required
              />
            </div>

            {/* Original Price */}
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
                className={inputClass}
              />
            </div>

            {/* Pages */}
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

            {/* Language */}
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

            {/* Description */}
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

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-5 py-3 text-sm text-[#A6A29A] transition hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-[#C6A66B] px-6 py-3 text-sm font-medium text-[#0B0B0C] transition hover:bg-[#D8BC82]"
            >
              {book ? 'Save Changes' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}