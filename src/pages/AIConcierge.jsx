import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Bot,
  Check,
  ChevronRight,
  Heart,
  LoaderCircle,
  MessageCircle,
  Send,
  Sparkles,
  Star,
} from 'lucide-react'

import { books } from '../data/books'

// ============================================================
// CONSTANTS
// ============================================================

const WISHLIST_KEY = 'smartbook-wishlist'

const suggestions = [
  {
    title: 'Personal growth',
    description: 'Books to improve myself and build better habits',
    icon: '🌱',
  },
  {
    title: 'Thrilling mysteries',
    description: 'Gripping stories full of suspense and surprises',
    icon: '🔍',
  },
  {
    title: 'Financial wisdom',
    description: 'Learn about money, investing, and wealth',
    icon: '💰',
  },
  {
    title: 'Peace of mind',
    description: 'Books about mindfulness and finding inner peace',
    icon: '🌿',
  },
]

// ============================================================
// SAFE DATA HELPERS
// ============================================================

function getBookTitle(book) {
  return book?.title || 'Untitled Book'
}

function getBookAccent(book) {
  return book?.coverAccent || '#C6A66B'
}

function getBookCoverColor(book) {
  return book?.coverColor || '#151515'
}

function getBookCoverText(book) {
  return book?.coverText || book?.title || 'SMARTBOOK'
}

function getBookDescription(book) {
  return book?.description || 'Description coming soon.'
}

function getBookPrice(book) {
  return Number(book?.price || 0)
}

function getBookRating(book) {
  return Number(book?.rating || 0)
}

function getBookPages(book) {
  return Number(book?.pages || 0)
}

function getBookReviews(book) {
  return Number(book?.reviews || 0)
}

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ============================================================
// WISHLIST HELPERS
// ============================================================

function getWishlist() {
  try {
    const wishlist = JSON.parse(
      localStorage.getItem(WISHLIST_KEY) || '[]',
    )

    return Array.isArray(wishlist) ? wishlist : []
  } catch {
    return []
  }
}

function isBookSaved(bookId) {
  return getWishlist().some((item) => item.id === bookId)
}

function toggleWishlistBook(bookId) {
  const wishlist = getWishlist()

  const exists = wishlist.some((item) => item.id === bookId)

  const updatedWishlist = exists
    ? wishlist.filter((item) => item.id !== bookId)
    : [...wishlist, { id: bookId }]

  try {
    localStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(updatedWishlist),
    )

    return !exists
  } catch {
    return exists
  }
}

// ============================================================
// BOOK RECOMMENDATION ENGINE
// ============================================================

function getRecommendations(query) {
  const normalizedQuery = normalizeText(query)

  if (!normalizedQuery) return []

  const topicGroups = [
    {
      keywords: [
        'habit',
        'habits',
        'routine',
        'discipline',
        'consistency',
      ],
      categories: ['self development', 'personal development'],
      bookIds: ['atomic-habits'],
    },
    {
      keywords: [
        'money',
        'finance',
        'financial',
        'wealth',
        'investing',
        'invest',
        'rich',
      ],
      categories: ['finance'],
      bookIds: [
        'psychology-of-money',
        'rich-dad-poor-dad',
        'think-grow-rich',
      ],
    },
    {
      keywords: [
        'thriller',
        'suspense',
        'psychological',
        'dark',
      ],
      categories: ['thriller'],
      bookIds: ['silent-patient'],
    },
    {
      keywords: [
        'mystery',
        'detective',
        'crime',
        'investigation',
      ],
      categories: ['mystery', 'thriller'],
      bookIds: ['sherlock-holmes', 'silent-patient'],
    },
    {
      keywords: [
        'peace',
        'calm',
        'stress',
        'mindfulness',
        'relax',
        'meditation',
      ],
      categories: ['philosophy'],
      bookIds: ['ikigai', 'the-power-of-now'],
    },
    {
      keywords: [
        'focus',
        'concentration',
        'study',
        'productivity',
        'work',
      ],
      categories: ['productivity'],
      bookIds: ['deep-work'],
    },
    {
      keywords: [
        'motivation',
        'success',
        'ambition',
        'goals',
        'growth',
      ],
      categories: ['personal development', 'self development'],
      bookIds: ['think-grow-rich', 'atomic-habits'],
    },
    {
      keywords: [
        'fiction',
        'novel',
        'story',
        'adventure',
        'imagination',
      ],
      categories: ['fiction'],
      bookIds: ['alchemist', '1984'],
    },
    {
      keywords: [
        'philosophy',
        'meaning',
        'purpose',
        'life',
        'happiness',
      ],
      categories: ['philosophy'],
      bookIds: ['ikigai', 'the-power-of-now', 'alchemist'],
    },
  ]

  const scoredBooks = books.map((book) => {
    let score = 0

    const title = normalizeText(book.title)
    const author = normalizeText(book.author)
    const category = normalizeText(book.category)
    const description = normalizeText(book.description)
    const bookId = normalizeText(book.id)

    const searchableText = `${title} ${author} ${category} ${description}`

    // Direct title and author matching
    if (title && normalizedQuery.includes(title)) {
      score += 20
    }

    if (author && normalizedQuery.includes(author)) {
      score += 12
    }

    if (bookId && normalizedQuery.includes(bookId.replace(/-/g, ' '))) {
      score += 15
    }

    // Topic-based recommendations
    topicGroups.forEach((group) => {
      const matchedKeywords = group.keywords.filter((keyword) =>
        normalizedQuery.includes(keyword),
      )

      if (matchedKeywords.length === 0) return

      if (group.categories.includes(category)) {
        score += 8
      }

      if (group.bookIds.includes(book.id)) {
        score += 10
      }

      matchedKeywords.forEach((keyword) => {
        if (searchableText.includes(keyword)) {
          score += 2
        }
      })
    })

    // Individual word matching
    const queryWords = normalizedQuery
      .split(/\s+/)
      .filter((word) => word.length > 2)

    queryWords.forEach((word) => {
      if (title.includes(word)) score += 5
      if (author.includes(word)) score += 3
      if (category.includes(word)) score += 4
      if (description.includes(word)) score += 2
    })

    // Highly rated books
    if (
      normalizedQuery.includes('highly rated') ||
      normalizedQuery.includes('best rated') ||
      normalizedQuery.includes('top rated')
    ) {
      const rating = getBookRating(book)

      if (rating >= 4.8) {
        score += 8
      } else if (rating >= 4.6) {
        score += 4
      }
    }

    // Short book preference
    if (
      normalizedQuery.includes('short book') ||
      normalizedQuery.includes('quick read') ||
      normalizedQuery.includes('small book') ||
      normalizedQuery.includes('less pages')
    ) {
      const pages = getBookPages(book)

      if (pages > 0 && pages <= 240) {
        score += 8
      } else if (pages > 240 && pages <= 280) {
        score += 4
      }
    }

    return {
      ...book,
      score,
    }
  })

  return scoredBooks
    .filter((book) => book.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        getBookRating(b) - getBookRating(a),
    )
    .slice(0, 3)
}

// ============================================================
// BOOK COMPARISON
// ============================================================

function detectBookComparison(query) {
  const text = normalizeText(query)

  const comparisonKeywords = [
    'compare',
    'comparison',
    'difference between',
    'versus',
    'vs',
    'which is better',
    'better than',
  ]

  return comparisonKeywords.some((keyword) =>
    text.includes(keyword),
  )
}

function findBooksToCompare(query) {
  const text = normalizeText(query)

  const matchedBooks = books.filter((book) => {
    const title = normalizeText(book.title)
    const id = normalizeText(book.id).replace(/-/g, ' ')

    return (
      (title && text.includes(title)) ||
      (id && text.includes(id))
    )
  })

  // Remove duplicates and return only two books
  const uniqueBooks = [
    ...new Map(
      matchedBooks.map((book) => [book.id, book]),
    ).values(),
  ]

  return uniqueBooks.slice(0, 2)
}

function createComparisonResponse(comparisonBooks) {
  if (comparisonBooks.length < 2) {
    return {
      success: false,
      message:
        'I would love to compare those books! Please mention two titles from our catalogue, such as "Compare Atomic Habits and Deep Work."',
    }
  }

  const [book1, book2] = comparisonBooks

  return {
    success: true,
    message: `Here's a comparison of "${book1.title}" and "${book2.title}" to help you decide which one suits your reading goals.`,
    books: comparisonBooks,
  }
}

// ============================================================
// BOOK SUMMARY
// ============================================================

function detectBookSummary(query) {
  const text = normalizeText(query)

  const summaryKeywords = [
    'summarize',
    'summary',
    'summarise',
    'overview',
    'what is this book about',
    'what is the book about',
    'explain this book',
    'tell me about this book',
    'book summary',
    'brief me about',
  ]

  const hasSummaryKeyword = summaryKeywords.some((keyword) =>
    text.includes(keyword),
  )

  const naturalSummaryPatterns = [
    /^what is .+ about$/,
    /^tell me about .+$/,
    /^explain .+$/,
    /^overview of .+$/,
  ]

  const matchesNaturalPattern = naturalSummaryPatterns.some(
    (pattern) => pattern.test(text),
  )

  return hasSummaryKeyword || matchesNaturalPattern
}

function findBookForSummary(query) {
  const text = normalizeText(query)

  return books.find((book) => {
    const title = normalizeText(book.title)
    const id = normalizeText(book.id).replace(/-/g, ' ')

    return (
      (title && text.includes(title)) ||
      (id && text.includes(id))
    )
  })
}

function createBookSummary(book) {
  if (!book) {
    return {
      success: false,
      message:
        'Which book would you like me to summarize? Please mention a title from our catalogue, such as "Summarize Atomic Habits" or "What is The Alchemist about?"',
      book: null,
    }
  }

  return {
    success: true,
    message: `Here's an overview of "${book.title}" based on its description in our catalogue.`,
    book,
    summary: getBookDescription(book),
  }
}

// ============================================================
// RESPONSE GENERATOR
// ============================================================

function createResponse(query, recommendations) {
  const text = normalizeText(query)

  // Thriller and mystery
  if (
    text.includes('thriller') ||
    text.includes('mystery') ||
    text.includes('suspense') ||
    text.includes('detective') ||
    text.includes('crime')
  ) {
    return 'You seem to enjoy stories filled with suspense, mystery, and unexpected twists. I have selected books that will keep you curious and engaged until the very end.'
  }

  // Finance and money
  if (
    text.includes('money') ||
    text.includes('finance') ||
    text.includes('wealth') ||
    text.includes('invest') ||
    text.includes('financial') ||
    text.includes('rich')
  ) {
    return 'Understanding money is about more than numbers. These books explore financial habits, wealth building, and the psychology behind better financial decisions.'
  }

  // Habits and personal development
  if (
    text.includes('habit') ||
    text.includes('growth') ||
    text.includes('productivity') ||
    text.includes('discipline') ||
    text.includes('motivation') ||
    text.includes('success') ||
    text.includes('improve myself')
  ) {
    return 'Your journey towards personal growth starts with small, consistent changes. These selections explore building better habits, improving discipline, and developing a productive mindset.'
  }

  // Focus and studying
  if (
    text.includes('focus') ||
    text.includes('concentration') ||
    text.includes('study') ||
    text.includes('distraction') ||
    text.includes('deep work')
  ) {
    return 'If you want to improve your concentration and get more meaningful work done, these books offer practical ideas about focus, productivity, and managing distractions.'
  }

  // Peace and mindfulness
  if (
    text.includes('peace') ||
    text.includes('mindfulness') ||
    text.includes('meditation') ||
    text.includes('spiritual') ||
    text.includes('stress') ||
    text.includes('anxiety') ||
    text.includes('calm')
  ) {
    return 'Sometimes, the best reading experience is one that helps you slow down and reflect. These books explore mindfulness, inner peace, purpose, and a more meaningful approach to everyday life.'
  }

  // Philosophy and purpose
  if (
    text.includes('philosophy') ||
    text.includes('purpose') ||
    text.includes('meaning of life') ||
    text.includes('happiness') ||
    text.includes('life lessons')
  ) {
    return 'If you enjoy exploring deeper questions about life, purpose, and happiness, these books offer thoughtful perspectives and ideas worth reflecting on.'
  }

  // Fiction and classics
  if (
    text.includes('fiction') ||
    text.includes('novel') ||
    text.includes('story') ||
    text.includes('adventure') ||
    text.includes('classic')
  ) {
    return 'A wonderful story can transport you into another world. I have selected some engaging reads featuring memorable stories, imaginative journeys, and timeless literary experiences.'
  }

  // Short books
  if (
    text.includes('short book') ||
    text.includes('quick read') ||
    text.includes('small book') ||
    text.includes('less pages')
  ) {
    return 'Looking for something you can finish without a huge time commitment? These selections are relatively shorter reads that still offer meaningful ideas and enjoyable experiences.'
  }

  // Highly rated books
  if (
    text.includes('highly rated') ||
    text.includes('best rated') ||
    text.includes('top rated') ||
    text.includes('popular')
  ) {
    return 'I have focused on highly rated and popular books from our catalogue. These reader favourites are a great starting point for discovering your next memorable read.'
  }

  // Recommendations found
  if (recommendations.length > 0) {
    return 'Based on what you described, I found some interesting matches in our collection. Each book offers something different, so explore their descriptions and discover which one speaks to you.'
  }

  return 'I could not find an exact match for that request in our current catalogue. Try describing a topic, genre, author, or reading goal, and I will help you discover something interesting.'
}

// ============================================================
// RECOMMENDATION CARD
// ============================================================

function RecommendationCard({ book }) {
  const [saved, setSaved] = useState(() => isBookSaved(book.id))

  function toggleWishlist() {
    const updatedSavedState = toggleWishlistBook(book.id)
    setSaved(updatedSavedState)
  }

  const accent = getBookAccent(book)

  return (
    <article className="group border border-white/10 bg-luxury-black p-4 transition hover:border-luxury-gold/40">
      <div className="flex gap-4">
        {/* Book Cover */}
        <Link
          to={`/books/${book.id}`}
          aria-label={`View ${getBookTitle(book)}`}
          className="flex h-40 w-28 shrink-0 items-center justify-center p-2 shadow-lg transition group-hover:-translate-y-1"
          style={{
            backgroundColor: getBookCoverColor(book),
          }}
        >
          <div
            className="flex h-full w-full flex-col items-center justify-center border p-2 text-center"
            style={{
              borderColor: `${accent}80`,
            }}
          >
            <BookOpen
              size={18}
              style={{ color: accent }}
            />

            <span
              className="mt-3 font-editorial text-xs font-semibold uppercase leading-4"
              style={{ color: accent }}
            >
              {getBookCoverText(book)}
            </span>
          </div>
        </Link>

        {/* Book Details */}
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-[10px] uppercase tracking-[0.18em] text-luxury-gold">
            {book.category || 'General'}
          </p>

          <Link
            to={`/books/${book.id}`}
            className="mt-2 font-editorial text-lg leading-snug transition hover:text-luxury-gold"
          >
            {getBookTitle(book)}
          </Link>

          <p className="mt-1 text-xs text-luxury-muted">
            {book.author || 'Unknown Author'}
          </p>

          <div className="mt-3 flex items-center gap-1 text-luxury-gold">
            <Star size={13} fill="currentColor" />

            <span className="text-xs">
              {getBookRating(book).toFixed(1)}
            </span>

            <span className="text-xs text-luxury-muted">
              ({getBookReviews(book).toLocaleString('en-IN')})
            </span>
          </div>

          {/* Price and Wishlist */}
          <div className="mt-auto flex items-center justify-between gap-2 pt-4">
            <span className="font-editorial text-lg">
              ₹{getBookPrice(book).toLocaleString('en-IN')}
            </span>

            <button
              type="button"
              onClick={toggleWishlist}
              aria-label={
                saved ? 'Remove from wishlist' : 'Add to wishlist'
              }
              title={
                saved ? 'Remove from wishlist' : 'Add to wishlist'
              }
              className={`flex h-9 w-9 items-center justify-center border transition ${
                saved
                  ? 'border-luxury-gold text-luxury-gold'
                  : 'border-white/15 text-luxury-muted hover:border-luxury-gold hover:text-luxury-gold'
              }`}
            >
              {saved ? <Check size={16} /> : <Heart size={16} />}
            </button>
          </div>
        </div>
      </div>

      <Link
        to={`/books/${book.id}`}
        className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-luxury-muted transition hover:text-luxury-gold"
      >
        View book details
        <ArrowRight size={15} />
      </Link>
    </article>
  )
}

// ============================================================
// BOOK SUMMARY CARD
// ============================================================

function BookSummaryCard({ book, summary }) {
  const accent = getBookAccent(book)

  return (
    <article className="mt-6 overflow-hidden border border-luxury-gold/25 bg-luxury-black">
      {/* Header */}
      <div className="border-b border-luxury-gold/20 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2 text-luxury-gold">
          <BookOpen size={17} />

          <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">
            Book Overview
          </p>
        </div>

        <h3 className="mt-2 font-editorial text-xl sm:text-2xl">
          {getBookTitle(book)}
        </h3>

        <p className="mt-1 text-xs text-luxury-muted">
          by {book.author || 'Unknown Author'}
        </p>
      </div>

      {/* Book Information */}
      <div className="flex flex-col gap-5 p-4 sm:flex-row sm:p-5">
        {/* Book Cover */}
        <Link
          to={`/books/${book.id}`}
          className="mx-auto flex h-44 w-32 shrink-0 flex-col items-center justify-center border p-3 text-center shadow-xl transition hover:-translate-y-1 sm:mx-0 sm:h-52 sm:w-36"
          style={{
            backgroundColor: getBookCoverColor(book),
            borderColor: `${accent}80`,
          }}
        >
          <BookOpen
            size={24}
            style={{ color: accent }}
          />

          <span
            className="mt-4 font-editorial text-sm font-semibold uppercase leading-5"
            style={{ color: accent }}
          >
            {getBookCoverText(book)}
          </span>
        </Link>

        {/* Summary */}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-luxury-gold">
            Overview
          </p>

          <p className="mt-3 text-sm leading-7 text-luxury-muted">
            {summary}
          </p>

          {/* Metadata */}
          <div className="mt-5 flex flex-wrap gap-3">
            <span className="border border-white/10 px-3 py-2 text-xs text-luxury-muted">
              {book.category || 'General'}
            </span>

            {getBookPages(book) > 0 && (
              <span className="border border-white/10 px-3 py-2 text-xs text-luxury-muted">
                {getBookPages(book)} pages
              </span>
            )}

            <span className="flex items-center gap-1 border border-white/10 px-3 py-2 text-xs text-luxury-gold">
              <Star size={12} fill="currentColor" />
              {getBookRating(book).toFixed(1)}/5
            </span>
          </div>

          {/* Book Details Link */}
          <Link
            to={`/books/${book.id}`}
            className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-luxury-gold transition hover:text-luxury-ivory"
          >
            Explore this book
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  )
}

// ============================================================
// COMPARISON CARD
// ============================================================

function BookComparisonCard({ comparison }) {
  const [book1, book2] = comparison

  const sameCategory =
    normalizeText(book1.category) === normalizeText(book2.category)

  return (
    <div className="mt-6 overflow-hidden border border-luxury-gold/25 bg-luxury-black">
      <div className="border-b border-luxury-gold/20 px-4 py-4">
        <h3 className="font-editorial text-xl text-luxury-gold">
          Book Comparison
        </h3>

        <p className="mt-1 text-xs text-luxury-muted">
          A closer look at both books to help you choose.
        </p>
      </div>

      <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        {comparison.map((book) => {
          const accent = getBookAccent(book)

          return (
            <div key={book.id} className="p-4 sm:p-5">
              <Link
                to={`/books/${book.id}`}
                className="mx-auto flex h-36 w-24 flex-col items-center justify-center border p-2 text-center shadow-lg transition hover:-translate-y-1 sm:h-44 sm:w-32"
                style={{
                  backgroundColor: getBookCoverColor(book),
                  borderColor: `${accent}80`,
                }}
              >
                <BookOpen
                  size={20}
                  style={{ color: accent }}
                />

                <span
                  className="mt-3 font-editorial text-xs font-semibold uppercase leading-4"
                  style={{ color: accent }}
                >
                  {getBookCoverText(book)}
                </span>
              </Link>

              <Link
                to={`/books/${book.id}`}
                className="mt-4 block font-editorial text-base leading-snug transition hover:text-luxury-gold sm:text-lg"
              >
                {getBookTitle(book)}
              </Link>

              <p className="mt-1 text-xs text-luxury-muted">
                {book.author || 'Unknown Author'}
              </p>

              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-luxury-muted">
                    Category
                  </span>

                  <span className="mt-1 block text-luxury-ivory">
                    {book.category || 'General'}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-luxury-muted">
                    Rating
                  </span>

                  <span className="mt-1 flex items-center gap-1 text-luxury-gold">
                    <Star size={12} fill="currentColor" />
                    {getBookRating(book).toFixed(1)}/5
                  </span>
                </div>

                {getBookPages(book) > 0 && (
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-luxury-muted">
                      Pages
                    </span>

                    <span className="mt-1 block text-luxury-ivory">
                      {getBookPages(book)}
                    </span>
                  </div>
                )}

                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-luxury-muted">
                    Price
                  </span>

                  <span className="mt-1 block font-editorial text-lg text-luxury-gold">
                    ₹{getBookPrice(book).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Comparison Summary */}
      <div className="border-t border-white/10 p-4">
        <p className="text-xs leading-6 text-luxury-muted">
          <span className="font-semibold text-luxury-gold">
            My suggestion:
          </span>{' '}
          {sameCategory
            ? `Both books belong to ${book1.category}. Explore their descriptions to decide which perspective interests you more.`
            : `These books explore different subjects. Choose ${book1.title} for ${String(book1.category || 'its subject').toLowerCase()}, or ${book2.title} for ${String(book2.category || 'its subject').toLowerCase()}.`}
        </p>
      </div>
    </div>
  )
}

// ============================================================
// MAIN AI CONCIERGE COMPONENT
// ============================================================

function AIConcierge() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  // ==========================================================
  // CHAT SUBMISSION
  // ==========================================================

  function handleSubmit(event) {
    event.preventDefault()

    const userQuery = query.trim()

    if (!userQuery || loading) return

    setLoading(true)
    setQuery('')

    window.setTimeout(() => {
      let newMessage

      // 1. Book comparison
      if (detectBookComparison(userQuery)) {
        const comparisonBooks = findBooksToCompare(userQuery)
        const comparison = createComparisonResponse(comparisonBooks)

        newMessage = {
          id: `${Date.now()}-${Math.random()}`,
          question: userQuery,
          answer: comparison.message,
          recommendations: [],
          comparison: comparison.success ? comparison.books : null,
          summary: null,
        }
      }

      // 2. Book summary
      else if (detectBookSummary(userQuery)) {
        const book = findBookForSummary(userQuery)
        const bookSummary = createBookSummary(book)

        newMessage = {
          id: `${Date.now()}-${Math.random()}`,
          question: userQuery,
          answer: bookSummary.message,
          recommendations: [],
          comparison: null,
          summary: bookSummary.success
            ? {
                book: bookSummary.book,
                text: bookSummary.summary,
              }
            : null,
        }
      }

      // 3. Normal recommendations
      else {
        const recommendations = getRecommendations(userQuery)

        newMessage = {
          id: `${Date.now()}-${Math.random()}`,
          question: userQuery,
          answer: createResponse(userQuery, recommendations),
          recommendations,
          comparison: null,
          summary: null,
        }
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        newMessage,
      ])

      setLoading(false)
    }, 600)
  }

  // ==========================================================
  // SUGGESTIONS
  // ==========================================================

  function handleSuggestion(description) {
    setQuery(description)
  }

  function clearConversation() {
    setMessages([])
    setQuery('')
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="min-h-screen bg-luxury-black text-luxury-ivory">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10 px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-luxury-gold/5 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-luxury-gold/30 bg-luxury-surface">
            <Sparkles
              size={28}
              strokeWidth={1.3}
              className="text-luxury-gold"
            />
          </div>

          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-luxury-gold">
            Your Personal Reading Guide
          </p>

          <h1 className="font-editorial text-4xl leading-tight sm:text-5xl lg:text-7xl">
            Meet Your
            <span className="block italic text-luxury-gold">
              AI Book Concierge.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-luxury-muted sm:text-base">
            Tell us what you're curious about, what you want to learn,
            or simply how you feel. Discover books selected around
            your interests.
          </p>
        </div>
      </section>

      {/* Concierge Workspace */}
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Suggestion Sidebar */}
          <aside>
            <div className="mb-5 flex items-center gap-2">
              <Sparkles size={17} className="text-luxury-gold" />

              <h2 className="font-editorial text-xl">
                Find Your Inspiration
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.title}
                  type="button"
                  onClick={() => handleSuggestion(suggestion.description)}
                  className="group flex items-start gap-4 border border-white/10 bg-luxury-surface/50 p-4 text-left transition hover:border-luxury-gold/40"
                >
                  <span className="text-2xl">{suggestion.icon}</span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium transition group-hover:text-luxury-gold">
                      {suggestion.title}
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-luxury-muted">
                      {suggestion.description}
                    </span>
                  </span>

                  <ChevronRight
                    size={16}
                    className="mt-1 shrink-0 text-luxury-muted transition group-hover:text-luxury-gold"
                  />
                </button>
              ))}
            </div>

            {/* Help Card */}
            <div className="mt-6 border border-luxury-gold/20 bg-luxury-surface p-5">
              <div className="flex items-center gap-2 text-luxury-gold">
                <MessageCircle size={17} />

                <h3 className="text-sm font-semibold">
                  Not sure what to read?
                </h3>
              </div>

              <p className="mt-3 text-xs leading-6 text-luxury-muted">
                Start with a feeling, a goal, a topic, or a genre.
                There are no wrong questions.
              </p>

              <Link
                to="/books"
                className="mt-4 inline-flex items-center gap-2 text-xs text-luxury-gold transition hover:text-luxury-ivory"
              >
                Browse the library
                <ArrowRight size={14} />
              </Link>
            </div>
          </aside>

          {/* Chat Area */}
          <div className="flex min-h-[620px] flex-col border border-white/10 bg-luxury-surface/40">
            {/* Chat Header */}
            <div className="flex items-center justify-between gap-4 border-b border-white/10 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center bg-luxury-gold text-luxury-black">
                  <Bot size={23} />
                </div>

                <div>
                  <h2 className="font-editorial text-lg">
                    SmartBook Concierge
                  </h2>

                  <p className="mt-1 text-[10px] uppercase tracking-widest text-luxury-muted">
                    Your reading companion
                  </p>
                </div>
              </div>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearConversation}
                  className="text-xs text-luxury-muted transition hover:text-luxury-gold"
                >
                  New chat
                </button>
              )}
            </div>

            {/* Conversation */}
            <div className="flex-1 space-y-8 p-4 sm:p-6">
              {/* Empty State */}
              {messages.length === 0 && (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-luxury-gold/20 bg-luxury-black">
                    <BookOpen size={24} className="text-luxury-gold" />
                  </div>

                  <h3 className="font-editorial text-2xl sm:text-3xl">
                    Every reader has a story.
                  </h3>

                  <p className="mt-4 max-w-md text-sm leading-7 text-luxury-muted">
                    What would you like your next chapter to be about?
                    Tell me what you're looking for, and let's explore.
                  </p>

                  <div className="mt-7 flex flex-wrap justify-center gap-2">
                    {[
                      'Books to build better habits',
                      'A mystery with a big twist',
                      'Learn to manage money',
                    ].map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleSuggestion(prompt)}
                        className="border border-white/10 px-3 py-2 text-xs text-luxury-muted transition hover:border-luxury-gold/40 hover:text-luxury-gold"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((message) => (
                <div key={message.id} className="space-y-6">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="max-w-[90%] bg-luxury-gold px-4 py-3 text-sm leading-6 text-luxury-black sm:max-w-[80%]">
                      {message.question}
                    </div>
                  </div>

                  {/* Concierge Response */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-luxury-black text-luxury-gold">
                      <Sparkles size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-luxury-gold">
                        Your reading recommendations
                      </p>

                      <p className="text-sm leading-7 text-luxury-muted">
                        {message.answer}
                      </p>

                      {/* Book Summary */}
                      {message.summary && (
                        <BookSummaryCard
                          book={message.summary.book}
                          summary={message.summary.text}
                        />
                      )}

                      {/* Book Comparison */}
                      {message.comparison && message.comparison.length === 2 && (
                        <BookComparisonCard comparison={message.comparison} />
                      )}

                      {/* Normal Recommendations */}
                      {message.recommendations.length > 0 && (
                        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
                          {message.recommendations.map((book) => (
                            <RecommendationCard
                              key={book.id}
                              book={book}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading */}
              {loading && (
                <div
                  role="status"
                  className="flex items-center gap-3 text-sm text-luxury-muted"
                >
                  <LoaderCircle
                    size={18}
                    className="animate-spin text-luxury-gold"
                  />

                  Finding books for you...
                </div>
              )}
            </div>

            {/* Prompt Input */}
            <div className="border-t border-white/10 p-4 sm:p-5">
              <form onSubmit={handleSubmit}>
                <label
                  htmlFor="concierge-prompt"
                  className="mb-3 block text-xs text-luxury-muted"
                >
                  Describe the book you're looking for
                </label>

                <div className="flex items-center gap-2 border border-white/15 bg-luxury-black p-2 transition focus-within:border-luxury-gold/60 sm:gap-3 sm:p-3">
                  <input
                    id="concierge-prompt"
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="I want a book that helps me..."
                    maxLength={500}
                    disabled={loading}
                    className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-luxury-ivory outline-none placeholder:text-luxury-muted/60 disabled:opacity-50"
                  />

                  <button
                    type="submit"
                    disabled={!query.trim() || loading}
                    aria-label="Get book recommendations"
                    className="flex h-11 w-11 shrink-0 items-center justify-center bg-luxury-gold text-luxury-black transition hover:bg-luxury-ivory disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send size={18} />
                  </button>
                </div>

                <p className="mt-3 text-[10px] leading-5 text-luxury-muted">
                  Demo mode: recommendations and summaries use your local book
                  catalogue. AI-generated responses will require a backend API.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AIConcierge