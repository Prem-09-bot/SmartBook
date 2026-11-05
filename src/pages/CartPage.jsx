import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from 'lucide-react'

import { books } from '../data/books'
import { useCart } from '../context/CartContext'

function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`
}

function CartPage() {
  const { cartItems, updateCartItem, removeCartItem } = useCart()
  const navigate = useNavigate()

  // Keep the cart saved in localStorage.
  useEffect(() => {
    localStorage.setItem('smartbook-cart', JSON.stringify(cartItems))
  }, [cartItems])

  // Calculate the subtotal.
  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + Number(item.price) * Number(item.quantity),
        0,
      ),
    [cartItems],
  )

  // Calculate the total number of books.
  const totalBooks = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + Number(item.quantity),
        0,
      ),
    [cartItems],
  )

  // Update quantity in the backend.
  async function updateQuantity(id, change) {
    const item = cartItems.find((entry) => entry.id === id)
    if (!item) return

    const quantity = Math.min(
      99,
      Math.max(1, Number(item.quantity) + change),
    )

    try {
      await updateCartItem(item, quantity)
    } catch (error) {
      window.alert(error.message)
    }
  }

  // Remove item from the backend.
  async function removeItem(id) {
    const item = cartItems.find((entry) => entry.id === id)
    if (!item) return

    try {
      await removeCartItem(item)
    } catch (error) {
      window.alert(error.message)
    }
  }

  // Navigate to checkout.
  function handleCheckout() {
    if (cartItems.length === 0) return

    navigate('/checkout')
  }

  // Empty cart screen.
  if (cartItems.length === 0) {
    return (
      <main className="min-h-[70vh] bg-luxury-black px-4 py-20 text-luxury-ivory sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="mb-7 flex h-24 w-24 items-center justify-center rounded-full border border-luxury-gold/20 bg-luxury-surface">
            <ShoppingBag
              size={38}
              className="text-luxury-gold"
            />
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-luxury-gold">
            Your Reading Journey
          </p>

          <h1 className="font-editorial text-4xl sm:text-5xl">
            Your bag is empty.
          </h1>

          <p className="mt-5 max-w-md text-sm leading-7 text-luxury-muted sm:text-base">
            Every great journey begins with a great book.
            Discover your next favourite read and add it to your collection.
          </p>

          <Link
            to="/books"
            className="mt-9 inline-flex items-center gap-3 bg-luxury-gold px-7 py-4 text-sm font-semibold text-luxury-black transition hover:bg-luxury-ivory"
          >
            Explore Books
            <ArrowRight size={17} />
          </Link>

          <Link
            to="/"
            className="mt-5 text-sm text-luxury-muted transition hover:text-luxury-gold"
          >
            Return to homepage
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-luxury-black px-4 py-10 text-luxury-ivory sm:px-6 sm:py-14">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <Link
          to="/books"
          className="mb-8 inline-flex items-center gap-2 text-sm text-luxury-muted transition hover:text-luxury-gold"
        >
          <ArrowLeft size={16} />
          Continue shopping
        </Link>

        {/* Heading */}
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-luxury-gold">
              Your Collection
            </p>

            <h1 className="font-editorial text-4xl sm:text-5xl">
              Shopping Bag
            </h1>

            <p className="mt-3 text-sm text-luxury-muted">
              {totalBooks} {totalBooks === 1 ? 'book' : 'books'} in your bag
            </p>
          </div>

          <ShoppingCart
            size={30}
            strokeWidth={1.3}
            className="hidden text-luxury-gold sm:block"
          />
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_350px]">
          {/* Cart items */}
          <section
            aria-label="Shopping cart items"
            className="space-y-5"
          >
            {cartItems.map((item) => {
              const book = books.find(
                (bookItem) => bookItem.id === item.id,
              )

              const coverColor = book?.coverColor || '#252525'
              const coverAccent = book?.coverAccent || '#C6A66B'
              const coverText = book?.coverText || item.title || 'Book'

              return (
                <article
                  key={item.id}
                  className="flex flex-col gap-5 border border-white/10 bg-luxury-surface/60 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6"
                >
                  {/* Book cover */}
                  <Link
                    to={`/books/${item.id}`}
                    className="mx-auto flex h-48 w-32 shrink-0 items-center justify-center p-3 shadow-xl transition hover:-translate-y-1 sm:mx-0"
                    style={{ backgroundColor: coverColor }}
                    aria-label={`View ${item.title || coverText}`}
                  >
                    <div
                      className="flex h-full w-full flex-col items-center justify-center border p-2 text-center"
                      style={{
                        borderColor: `${coverAccent}80`,
                      }}
                    >
                      <BookOpen
                        size={20}
                        style={{ color: coverAccent }}
                        strokeWidth={1.2}
                      />

                      <span
                        className="mt-4 line-clamp-4 font-editorial text-sm font-semibold uppercase leading-5"
                        style={{ color: coverAccent }}
                      >
                        {coverText}
                      </span>

                      <span
                        className="mt-auto text-[8px] uppercase tracking-widest"
                        style={{ color: coverAccent }}
                      >
                        SmartBook Edition
                      </span>
                    </div>
                  </Link>

                  {/* Book information */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-luxury-gold">
                          {book?.category || 'Book'}
                        </p>

                        <Link
                          to={`/books/${item.id}`}
                          className="font-editorial text-xl leading-snug transition hover:text-luxury-gold sm:text-2xl"
                        >
                          {item.title || book?.title || 'Book'}
                        </Link>

                        {book?.author && (
                          <p className="mt-2 text-sm text-luxury-muted">
                            by {book.author}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 p-2 text-luxury-muted transition hover:bg-red-500/10 hover:text-red-400"
                        aria-label={`Remove ${item.title || 'book'} from cart`}
                        title="Remove book"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                      {/* Quantity selector */}
                      <div>
                        <p className="mb-2 text-xs text-luxury-muted">
                          Quantity
                        </p>

                        <div className="flex items-center border border-white/15">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={Number(item.quantity) <= 1}
                            className="p-2.5 text-luxury-ivory transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="min-w-10 text-center text-sm">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={Number(item.quantity) >= 99}
                            className="p-2.5 text-luxury-ivory transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Item total */}
                      <div className="text-right">
                        <p className="mb-1 text-xs text-luxury-muted">
                          Item total
                        </p>

                        <p className="font-editorial text-xl text-luxury-gold">
                          {formatPrice(
                            Number(item.price) * Number(item.quantity),
                          )}
                        </p>

                        <p className="mt-1 text-xs text-luxury-muted">
                          {formatPrice(item.price)} each
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>

          {/* Order summary */}
          <aside className="border border-white/10 bg-luxury-surface p-6 sm:p-7 lg:sticky lg:top-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-luxury-gold">
              Your Order
            </p>

            <h2 className="mt-3 font-editorial text-2xl">
              Order Summary
            </h2>

            <div className="mt-7 space-y-4 border-b border-white/10 pb-6">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-luxury-muted">
                  Subtotal ({totalBooks}{' '}
                  {totalBooks === 1 ? 'item' : 'items'})
                </span>

                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-luxury-muted">Shipping</span>
                <span className="text-luxury-gold">
                  Calculated at checkout
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-luxury-muted">Discount</span>
                <span>—</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 py-6">
              <span className="font-medium">Estimated total</span>

              <span className="font-editorial text-2xl text-luxury-gold">
                {formatPrice(subtotal)}
              </span>
            </div>

            {/* FIXED CHECKOUT BUTTON */}
            <button
              type="button"
              onClick={handleCheckout}
              className="flex w-full items-center justify-center gap-3 bg-luxury-gold px-5 py-4 text-sm font-semibold text-luxury-black transition hover:bg-luxury-ivory"
            >
              Proceed to Checkout
              <ArrowRight size={17} />
            </button>

            <div className="mt-6 flex items-start gap-3">
              <Check
                size={17}
                className="mt-0.5 shrink-0 text-luxury-gold"
              />

              <p className="text-xs leading-6 text-luxury-muted">
                Your cart is saved in this browser. Payment processing
                will be connected when the backend is ready.
              </p>
            </div>

            <Link
              to="/books"
              className="mt-6 flex items-center justify-center gap-2 border border-white/15 px-5 py-3 text-sm transition hover:border-luxury-gold hover:text-luxury-gold"
            >
              <ArrowLeft size={15} />
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default CartPage