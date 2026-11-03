
import { Link } from 'react-router-dom'
import { Heart, Star, ShoppingBag } from 'lucide-react'

import { useWishlist } from '../context/WishlistContext'

export default function BookCard({ book }) {
  const { isInWishlist, toggleWishlist } = useWishlist()

  const isWishlisted = isInWishlist(book.id)

  function handleWishlistClick(event) {
    event.preventDefault()
    event.stopPropagation()
    toggleWishlist(book)
  }

  return (
    <article className="group min-w-0">
      {/* Book Cover */}
      <div
        className="relative aspect-[3/4] overflow-hidden"
        style={{ backgroundColor: book.coverColor }}
      >
        {/* Decorative Cover Design */}
        <div
          className="absolute inset-3 border opacity-70"
          style={{ borderColor: book.coverAccent }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center transition duration-500 group-hover:scale-105">
          <div
            className="mb-5 h-1 w-10"
            style={{ backgroundColor: book.coverAccent }}
          />

          <h3
            className="max-w-full font-editorial text-xl font-semibold leading-tight sm:text-2xl"
            style={{ color: book.coverAccent }}
          >
            {book.coverText}
          </h3>

          <div
            className="mt-5 h-px w-12"
            style={{ backgroundColor: book.coverAccent }}
          />

          <p
            className="mt-4 text-[9px] uppercase tracking-[0.2em]"
            style={{ color: book.coverAccent }}
          >
            {book.author}
          </p>
        </div>

        {/* Badge */}
        {book.badge && (
          <span className="absolute left-2 top-2 z-10 bg-luxury-ivory px-2 py-1 text-[9px] font-medium uppercase tracking-wider text-luxury-black sm:left-3 sm:top-3 sm:px-3 sm:py-2">
            {book.badge}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          aria-label={
            isWishlisted
              ? `Remove ${book.title} from wishlist`
              : `Add ${book.title} to wishlist`
          }
          aria-pressed={isWishlisted}
          onClick={handleWishlistClick}
          className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center bg-luxury-black/80 text-luxury-ivory transition hover:text-luxury-gold sm:right-3 sm:top-3"
        >
          <Heart
            size={17}
            fill={isWishlisted ? 'currentColor' : 'none'}
            className={
              isWishlisted ? 'text-luxury-gold' : ''
            }
          />
        </button>

        {/* Quick View */}
        <Link
          to={`/books/${book.id}`}
          className="absolute bottom-0 left-0 right-0 flex translate-y-full items-center justify-center gap-2 bg-luxury-gold px-3 py-3 text-xs font-semibold text-luxury-black transition-transform duration-300 group-hover:translate-y-0"
        >
          <ShoppingBag size={15} />
          View Book
        </Link>
      </div>

      {/* Book Information */}
      <div className="pt-4">
        <p className="text-[10px] uppercase tracking-[0.15em] text-luxury-gold">
          {book.category}
        </p>

        <Link to={`/books/${book.id}`}>
          <h3 className="mt-2 line-clamp-2 font-editorial text-base leading-snug text-luxury-ivory transition hover:text-luxury-gold sm:text-lg">
            {book.title}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-1 text-xs text-luxury-muted">
          {book.author}
        </p>

        {/* Rating */}
        <div className="mt-3 flex items-center gap-2">
          <Star
            size={14}
            fill="currentColor"
            className="shrink-0 text-luxury-gold"
          />

          <span className="text-xs text-luxury-ivory">
            {book.rating}
          </span>

          <span className="text-xs text-luxury-muted">
            ({Number(book.reviews).toLocaleString('en-IN')})
          </span>
        </div>

        {/* Price */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-luxury-ivory">
            ₹{book.price}
          </span>

          {book.originalPrice > book.price && (
            <>
              <span className="text-xs text-luxury-muted line-through">
                ₹{book.originalPrice}
              </span>

              <span className="text-[10px] font-medium text-luxury-gold">
                {Math.round(
                  ((book.originalPrice - book.price) /
                    book.originalPrice) *
                    100,
                )}
                % OFF
              </span>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
