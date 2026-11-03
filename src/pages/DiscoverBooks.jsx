import { useMemo, useState } from 'react'
import {
  Search,
  SlidersHorizontal,
  X,
  BookOpen,
  ArrowUpDown,
} from 'lucide-react'

import { books } from '../data/books'
import BookCard from '../components/BookCard'

const categories = [
  'All Categories',
  ...new Set(books.map((book) => book.category)),
]

const sortOptions = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Title: A to Z', value: 'title' },
]

export default function DiscoverBooks() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] =
    useState('All Categories')
  const [sortBy, setSortBy] = useState('recommended')
  const [maxPrice, setMaxPrice] = useState(1000)
  const [minimumRating, setMinimumRating] = useState('0')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filteredBooks = useMemo(() => {
    let result = [...books]

    // Search by title, author, category, or description.
    const query = searchQuery.trim().toLowerCase()

    if (query) {
      result = result.filter((book) =>
        [
          book.title,
          book.author,
          book.category,
          book.description,
        ].some((value) => value.toLowerCase().includes(query)),
      )
    }

    // Category filter.
    if (selectedCategory !== 'All Categories') {
      result = result.filter(
        (book) => book.category === selectedCategory,
      )
    }

    // Maximum price filter.
    result = result.filter((book) => book.price <= maxPrice)

    // Minimum rating filter.
    result = result.filter(
      (book) => book.rating >= Number(minimumRating),
    )

    // Sorting.
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break

      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break

      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break

      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break

      default:
        break
    }

    return result
  }, [
    searchQuery,
    selectedCategory,
    sortBy,
    maxPrice,
    minimumRating,
  ])

  function resetFilters() {
    setSearchQuery('')
    setSelectedCategory('All Categories')
    setSortBy('recommended')
    setMaxPrice(1000)
    setMinimumRating('0')
  }

  const activeFilters =
    selectedCategory !== 'All Categories' ||
    maxPrice !== 1000 ||
    minimumRating !== '0'

  return (
    <main className="min-h-screen bg-luxury-black">

      {/* Page Hero */}
      <section className="border-b border-white/10 px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <p className="text-xs uppercase tracking-[0.25em] text-luxury-gold">
            The SmartBook Collection
          </p>

          <h1 className="mt-5 font-editorial text-5xl text-luxury-ivory sm:text-6xl lg:text-7xl">
            Discover Books.
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-luxury-muted sm:text-base">
            From unforgettable fiction to ideas that change the way
            you think, discover your next great read.
          </p>

          <div className="mt-8 flex flex-wrap gap-8">
            <div>
              <p className="font-editorial text-3xl text-luxury-ivory">
                {books.length}
              </p>

              <p className="mt-1 text-xs text-luxury-muted">
                Featured titles
              </p>
            </div>

            <div>
              <p className="font-editorial text-3xl text-luxury-ivory">
                {categories.length - 1}
              </p>

              <p className="mt-1 text-xs text-luxury-muted">
                Categories
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1440px]">

          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Search */}
            <div className="flex flex-1 items-center gap-3 border border-white/10 bg-luxury-surface px-4 transition focus-within:border-luxury-gold/60">
              <Search
                size={19}
                className="shrink-0 text-luxury-muted"
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search books, authors, genres..."
                aria-label="Search books"
                className="w-full bg-transparent py-4 text-sm text-luxury-ivory outline-none placeholder:text-luxury-muted"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="text-luxury-muted hover:text-luxury-ivory"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-3 border border-white/10 bg-luxury-surface px-4 lg:min-w-[230px]">
              <ArrowUpDown
                size={17}
                className="shrink-0 text-luxury-gold"
              />

              <label htmlFor="book-sort" className="sr-only">
                Sort books
              </label>

              <select
                id="book-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="w-full cursor-pointer bg-transparent py-4 text-sm text-luxury-ivory outline-none"
              >
                {sortOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-luxury-surface"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              className="flex items-center justify-center gap-3 border border-luxury-gold/40 px-5 py-4 text-sm text-luxury-gold transition hover:bg-luxury-gold hover:text-luxury-black lg:hidden"
            >
              <SlidersHorizontal size={17} />

              {filtersOpen ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Filter Panel */}
          <div
            className={`mt-5 grid gap-6 border border-white/10 bg-luxury-surface p-5 sm:p-6 lg:grid-cols-3 ${
              filtersOpen ? 'grid' : 'hidden lg:grid'
            }`}
          >
            {/* Category */}
            <div>
              <label
                htmlFor="book-category"
                className="mb-3 block text-xs uppercase tracking-[0.15em] text-luxury-muted"
              >
                Category
              </label>

              <select
                id="book-category"
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(event.target.value)
                }
                className="w-full border border-white/10 bg-luxury-black px-4 py-3 text-sm text-luxury-ivory outline-none focus:border-luxury-gold/60"
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                    className="bg-luxury-black"
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Maximum Price */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label
                  htmlFor="max-price"
                  className="text-xs uppercase tracking-[0.15em] text-luxury-muted"
                >
                  Maximum Price
                </label>

                <span className="text-sm text-luxury-gold">
                  ₹{maxPrice}
                </span>
              </div>

              <input
                id="max-price"
                type="range"
                min="200"
                max="1000"
                step="50"
                value={maxPrice}
                onChange={(event) =>
                  setMaxPrice(Number(event.target.value))
                }
                className="w-full cursor-pointer accent-[#C6A66B]"
              />

              <div className="mt-2 flex justify-between text-xs text-luxury-muted">
                <span>₹200</span>
                <span>₹1,000</span>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label
                htmlFor="minimum-rating"
                className="mb-3 block text-xs uppercase tracking-[0.15em] text-luxury-muted"
              >
                Minimum Rating
              </label>

              <select
                id="minimum-rating"
                value={minimumRating}
                onChange={(event) =>
                  setMinimumRating(event.target.value)
                }
                className="w-full border border-white/10 bg-luxury-black px-4 py-3 text-sm text-luxury-ivory outline-none focus:border-luxury-gold/60"
              >
                <option value="0">All Ratings</option>
                <option value="4">4.0 and above</option>
                <option value="4.5">4.5 and above</option>
                <option value="4.7">4.7 and above</option>
              </select>
            </div>
          </div>

          {/* Results Header */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="text-sm text-luxury-ivory">
                Showing{' '}
                <span className="font-semibold text-luxury-gold">
                  {filteredBooks.length}
                </span>{' '}
                {filteredBooks.length === 1 ? 'book' : 'books'}
              </p>

              {(searchQuery || activeFilters) && (
                <p className="mt-2 text-xs text-luxury-muted">
                  Your results reflect the selected search and filters.
                </p>
              )}
            </div>

            {(searchQuery ||
              activeFilters ||
              sortBy !== 'recommended') && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 text-xs text-luxury-gold transition hover:text-luxury-ivory"
              >
                <X size={14} />
                Reset all
              </button>
            )}
          </div>

          {/* Book Grid */}
          {filteredBooks.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <BookOpen
                size={40}
                strokeWidth={1.2}
                className="text-luxury-gold"
              />

              <h2 className="mt-6 font-editorial text-3xl text-luxury-ivory">
                No books found.
              </h2>

              <p className="mt-3 max-w-md text-sm leading-7 text-luxury-muted">
                Try a different search, choose another category, or
                adjust your filters to discover more books.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-7 bg-luxury-gold px-6 py-3 text-sm font-semibold text-luxury-black transition hover:bg-luxury-ivory"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}