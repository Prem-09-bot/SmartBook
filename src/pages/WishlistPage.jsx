
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Heart,
  ShoppingCart,
  Star,
  Trash2,
} from 'lucide-react'

import { books } from '../data/books'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`
}

export default function WishlistPage() {
  const {
    wishlistItems,
    removeFromWishlist,
  } = useWishlist()

  const { addToCartBySlug } = useCart()
  const [message, setMessage] = useState('')

  // Clear feedback messages automatically.
  useEffect(() => {
    if (!message) return undefined

    const timer = window.setTimeout(() => {
      setMessage('')
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [message])

  async function addToCart(book) {
    try {
      await addToCartBySlug(book, 1)
      setMessage(`${book.title} added to your shopping cart.`)
    } catch (error) {
      setMessage(error.message || 'Unable to add this book. Please try again.')
    }
  }

  // Resolve saved IDs against the current book catalogue.
  const savedBooks = wishlistItems
    .map((item) => books.find((book) => book.id === item.id))
    .filter(Boolean)

  return (
    <main className="min-h-screen bg-luxury-black px-4 py-12 text-luxury-ivory sm:px-6 sm:py-16 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        {/* Page Heading */}
        <div className="mb-12 border-b border-white/10 pb-8 sm:mb-14">
          <div className="mb-4 flex items-center gap-3">
            <Heart
              size={20}
              className="text-luxury-gold"
              strokeWidth={1.5}
            />

            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-luxury-gold">
              Your Personal Collection
            </p>
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl">
            Your Wishlist
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-luxury-muted sm:text-base">
            Keep the books you love close. Save your favourites and
            return whenever you're ready to make them yours.
          </p>

          <p className="mt-5 text-sm text-luxury-muted">
            {savedBooks.length}{' '}
            {savedBooks.length === 1 ? 'book' : 'books'} saved
          </p>
        </div>

        {/* Feedback Message */}
        {message && (
          <div
            role="status"
            className="mb-8 flex items-start justify-between gap-4 border border-luxury-gold/20 bg-luxury-surface px-4 py-3 text-sm text-luxury-gold"
          >
            <p>{message}</p>

            <button
              type="button"
              onClick={() => setMessage('')}
              aria-label="Dismiss message"
              className="text-luxury-muted transition hover:text-luxury-ivory"
            >
              ✕
            </button>
          </div>
        )}

        {/* Empty Wishlist */}
        {savedBooks.length === 0 ? (
          <section className="flex min-h-[40vh] flex-col items-center justify-center py-12 text-center">
            <div className="mb-7 flex h-24 w-24 items-center justify-center rounded-full border border-luxury-gold/20 bg-luxury-surface">
              <Heart
                size={38}
                strokeWidth={1.2}
                className="text-luxury-gold"
              />
            </div>

            <h2 className="font-editorial text-3xl sm:text-4xl">
              Nothing saved just yet.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-7 text-luxury-muted">
              Every great collection starts somewhere. Explore our
              library and save the books that speak to you.
            </p>

            <Link
              to="/books"
              className="mt-8 inline-flex items-center gap-3 bg-luxury-gold px-7 py-4 text-sm font-semibold text-luxury-black transition hover:bg-luxury-ivory"
            >
              Discover Books
              <ArrowRight size={17} />
            </Link>
          </section>
        ) : (
          <>
            {/* Wishlist Toolbar */}
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.2em] text-luxury-muted">
                Saved for another day
              </p>

              <Link
                to="/books"
                className="inline-flex items-center gap-2 text-sm text-luxury-gold transition hover:text-luxury-ivory"
              >
                Explore more books
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Wishlist Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {savedBooks.map((book) => (
                <article
                  key={book.id}
                  className="group flex flex-col border border-white/10 bg-luxury-surface/50 p-4 transition duration-300 hover:border-luxury-gold/30 sm:p-5"
                >
                  <div className="flex gap-5">
                    {/* Book Cover */}
                    <Link
                      to={`/books/${book.id}`}
                      aria-label={`View ${book.title}`}
                      className="relative flex h-48 w-32 shrink-0 items-center justify-center overflow-hidden p-3 shadow-xl transition duration-300 group-hover:-translate-y-1 sm:h-52 sm:w-36"
                      style={{ backgroundColor: book.coverColor }}
                    >
                      <div
                        className="flex h-full w-full flex-col items-center justify-center border p-2 text-center"
                        style={{
                          borderColor: `${book.coverAccent}80`,
                        }}
                      >
                        <BookOpen
                          size={21}
                          strokeWidth={1.2}
                          style={{ color: book.coverAccent }}
                        />

                        <span
                          className="mt-4 line-clamp-4 font-editorial text-sm font-semibold uppercase leading-5"
                          style={{ color: book.coverAccent }}
                        >
                          {book.coverText}
                        </span>

                        <span
                          className="mt-auto text-[8px] uppercase tracking-widest"
                          style={{ color: book.coverAccent }}
                        >
                          SmartBook Edition
                        </span>
                      </div>

                      {book.badge && (
                        <span className="absolute left-2 top-2 bg-luxury-ivory px-2 py-1 text-[8px] uppercase tracking-wider text-luxury-black">
                          {book.badge}
                        </span>
                      )}
                    </Link>

                    {/* Book Information */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-luxury-gold">
                        {book.category}
                      </p>

                      <Link
                        to={`/books/${book.id}`}
                        className="mt-2 font-editorial text-lg leading-snug transition hover:text-luxury-gold sm:text-xl"
                      >
                        {book.title}
                      </Link>

                      <p className="mt-2 text-xs leading-5 text-luxury-muted">
                        {book.author}
                      </p>

                      <div className="mt-3 flex items-center gap-1 text-luxury-gold">
                        <Star size={13} fill="currentColor" />

                        <span className="text-xs">
                          {book.rating}
                        </span>

                        <span className="text-xs text-luxury-muted">
                          ({Number(book.reviews).toLocaleString('en-IN')})
                        </span>
                      </div>

                      <div className="mt-auto pt-5">
                        <p className="font-editorial text-xl text-luxury-ivory">
                          {formatPrice(book.price)}
                        </p>

                        {book.originalPrice > book.price && (
                          <p className="mt-1 text-xs text-luxury-muted line-through">
                            {formatPrice(book.originalPrice)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 grid grid-cols-1 gap-3 border-t border-white/10 pt-5 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => addToCart(book)}
                      className="flex items-center justify-center gap-2 bg-luxury-gold px-3 py-3 text-xs font-semibold text-luxury-black transition hover:bg-luxury-ivory"
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        removeFromWishlist(book.id)
                        setMessage(`${book.title} removed from your wishlist.`)
                      }}
                      className="flex items-center justify-center gap-2 border border-white/15 px-3 py-3 text-xs text-luxury-muted transition hover:border-red-400/50 hover:text-red-400"
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
