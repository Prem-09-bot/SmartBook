
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Check,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react'

import { books } from '../data/books'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function BookDetails() {
  const { id } = useParams()
  const { addToCartBySlug } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const book = books.find((item) => item.id === id)

  const [quantity, setQuantity] = useState(1)
  const [cartMessage, setCartMessage] = useState('')
  const [wishlistMessage, setWishlistMessage] = useState('')

  const isWishlisted = book ? isInWishlist(book.id) : false

  if (!book) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-luxury-black px-5">
        <div className="max-w-md text-center">
          <BookOpen
            size={42}
            className="mx-auto text-luxury-gold"
            strokeWidth={1.2}
          />

          <h1 className="mt-6 font-editorial text-4xl text-luxury-ivory">
            Book not found
          </h1>

          <p className="mt-4 text-sm leading-7 text-luxury-muted">
            This book may no longer be available in our collection.
          </p>

          <Link
            to="/books"
            className="mt-7 inline-flex items-center gap-2 bg-luxury-gold px-6 py-3 text-sm font-semibold text-luxury-black transition hover:bg-luxury-ivory"
          >
            <ArrowLeft size={16} />
            Explore Books
          </Link>
        </div>
      </main>
    )
  }

  const discount =
    book.originalPrice > book.price
      ? Math.round(
          ((book.originalPrice - book.price) / book.originalPrice) * 100,
        )
      : 0

  async function handleAddToCart() {
    try {
      await addToCartBySlug(book, quantity)
      setCartMessage(
        `${quantity} ${quantity === 1 ? 'copy' : 'copies'} of "${book.title}" added to your cart.`,
      )
    } catch (error) {
      setCartMessage(error.message || 'Unable to add this book. Please try again.')
    }
  }

  function handleWishlist() {
    const wasWishlisted = isInWishlist(book.id)

    toggleWishlist(book)

    setWishlistMessage(
      wasWishlisted
        ? `${book.title} removed from your wishlist.`
        : `${book.title} added to your wishlist.`,
    )
  }

  return (
    <main className="min-h-screen bg-luxury-black">
      {/* Breadcrumb */}
      <div className="border-b border-white/10 px-5 py-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <Link
            to="/books"
            className="inline-flex items-center gap-2 text-xs text-luxury-muted transition hover:text-luxury-gold"
          >
            <ArrowLeft size={15} />
            Back to Discover Books
          </Link>
        </div>
      </div>

      {/* Product Details */}
      <section className="px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Book Cover */}
          <div className="mx-auto w-full max-w-[460px]">
            <div
              className="relative aspect-[3/4] overflow-hidden shadow-2xl shadow-black/40"
              style={{ backgroundColor: book.coverColor }}
            >
              <div
                className="absolute inset-5 border opacity-70 sm:inset-8"
                style={{ borderColor: book.coverAccent }}
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                <div
                  className="mb-8 h-1 w-14"
                  style={{ backgroundColor: book.coverAccent }}
                />

                <h2
                  className="max-w-full break-words font-editorial text-3xl font-semibold leading-tight sm:text-5xl"
                  style={{ color: book.coverAccent }}
                >
                  {book.coverText}
                </h2>

                <div
                  className="mt-8 h-px w-16"
                  style={{ backgroundColor: book.coverAccent }}
                />

                <p
                  className="mt-5 text-xs uppercase tracking-[0.2em]"
                  style={{ color: book.coverAccent }}
                >
                  {book.author}
                </p>
              </div>

              {book.badge && (
                <span className="absolute left-5 top-5 bg-luxury-ivory px-4 py-2 text-[10px] uppercase tracking-wider text-luxury-black">
                  {book.badge}
                </span>
              )}
            </div>

            <p className="mt-4 text-center text-xs text-luxury-muted">
              Cover illustration for demonstration purposes
            </p>
          </div>

          {/* Product Information */}
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.25em] text-luxury-gold">
              {book.category}
            </p>

            <h1 className="mt-5 font-editorial text-4xl leading-tight text-luxury-ivory sm:text-5xl lg:text-6xl">
              {book.title}
            </h1>

            <p className="mt-5 text-sm text-luxury-muted">
              By <span className="text-luxury-ivory">{book.author}</span>
            </p>

            {/* Rating */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 text-luxury-gold">
                <Star size={17} fill="currentColor" />

                <span className="text-sm font-semibold">
                  {book.rating}
                </span>
              </div>

              <span className="text-sm text-luxury-muted">
                {Number(book.reviews).toLocaleString('en-IN')} reader ratings
              </span>
            </div>

            <div className="my-8 border-t border-white/10" />

            {/* Pricing */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-3xl font-semibold text-luxury-ivory">
                ₹{Number(book.price).toLocaleString('en-IN')}
              </span>

              {book.originalPrice > book.price && (
                <>
                  <span className="text-base text-luxury-muted line-through">
                    ₹{Number(book.originalPrice).toLocaleString('en-IN')}
                  </span>

                  <span className="border border-luxury-gold/30 px-3 py-1 text-xs text-luxury-gold">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            <p className="mt-3 text-xs text-luxury-muted">
              Taxes and delivery charges will be calculated at checkout.
            </p>

            {/* Description */}
            <div className="mt-8">
              <h2 className="font-editorial text-2xl text-luxury-ivory">
                About this book
              </h2>

              <p className="mt-4 text-sm leading-8 text-luxury-muted">
                {book.description}
              </p>
            </div>

            {/* Book Information */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-y border-white/10 py-6">
              <div>
                <p className="text-xs text-luxury-muted">Pages</p>
                <p className="mt-2 text-sm text-luxury-ivory">
                  {book.pages}
                </p>
              </div>

              <div>
                <p className="text-xs text-luxury-muted">Language</p>
                <p className="mt-2 text-sm text-luxury-ivory">
                  {book.language}
                </p>
              </div>

              <div>
                <p className="text-xs text-luxury-muted">Format</p>
                <p className="mt-2 text-sm text-luxury-ivory">
                  Paperback
                </p>
              </div>

              <div>
                <p className="text-xs text-luxury-muted">Availability</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-luxury-gold">
                  <Check size={15} />
                  Demo listing
                </p>
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-8">
              <p className="mb-3 text-xs uppercase tracking-[0.15em] text-luxury-muted">
                Quantity
              </p>

              <div className="inline-flex items-center border border-white/10">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() => {
                    setQuantity((current) => Math.max(1, current - 1))
                    setCartMessage('')
                  }}
                  className="p-3 text-luxury-ivory transition hover:text-luxury-gold disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus size={16} />
                </button>

                <span className="min-w-12 text-center text-sm text-luxury-ivory">
                  {quantity}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={quantity >= 10}
                  onClick={() => {
                    setQuantity((current) => Math.min(10, current + 1))
                    setCartMessage('')
                  }}
                  className="p-3 text-luxury-ivory transition hover:text-luxury-gold disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>

              <p className="mt-2 text-xs text-luxury-muted">
                Maximum 10 books per selection.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-3 bg-luxury-gold px-6 py-4 text-sm font-semibold text-luxury-black transition hover:bg-luxury-ivory"
              >
                <ShoppingBag size={18} />
                Add to Cart — ₹
                {Number(book.price * quantity).toLocaleString('en-IN')}
              </button>

              <button
                type="button"
                onClick={handleWishlist}
                aria-label={
                  isWishlisted
                    ? `Remove ${book.title} from wishlist`
                    : `Add ${book.title} to wishlist`
                }
                aria-pressed={isWishlisted}
                className={`flex items-center justify-center gap-2 border px-5 py-4 text-sm transition ${
                  isWishlisted
                    ? 'border-luxury-gold text-luxury-gold'
                    : 'border-white/15 text-luxury-ivory hover:border-luxury-gold hover:text-luxury-gold'
                }`}
              >
                <Heart
                  size={18}
                  fill={isWishlisted ? 'currentColor' : 'none'}
                />

                {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Wishlist Feedback */}
            {wishlistMessage && (
              <p
                role="status"
                className="mt-4 border border-luxury-gold/20 bg-luxury-surface p-3 text-sm text-luxury-gold"
              >
                {wishlistMessage}
              </p>
            )}

            {/* Cart Feedback */}
            {cartMessage && (
              <div
                role="status"
                className="mt-4 border border-luxury-gold/30 bg-luxury-surface p-4 text-sm leading-6 text-luxury-gold"
              >
                {cartMessage}{' '}

                <Link
                  to="/cart"
                  className="inline-block underline underline-offset-4"
                >
                  View cart
                </Link>
              </div>
            )}

            {/* Delivery Information */}
            <div className="mt-8 flex items-start gap-3 text-luxury-muted">
              <Truck
                size={19}
                className="mt-1 shrink-0 text-luxury-gold"
              />

              <div>
                <p className="text-sm text-luxury-ivory">
                  Delivery information
                </p>

                <p className="mt-1 text-xs leading-6">
                  Delivery estimates and shipping options will be connected
                  to the backend during integration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
