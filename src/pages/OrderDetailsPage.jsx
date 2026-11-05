
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react'

import { books } from '../data/books'
import { useCart } from '../context/CartContext'

const ORDERS_KEY = 'smartbook-orders'

function readOrders() {
  try {
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]')
    return Array.isArray(orders) ? orders : []
  } catch {
    return []
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString('en-IN')}`
}

function formatDate(dateValue) {
  if (!dateValue) return 'Date unavailable'

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return String(dateValue)

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function canCancelOrder(status) {
  return ['pending', 'processing', 'placed', 'order placed'].includes(
    String(status || 'Processing').toLowerCase(),
  )
}

function getTrackingSteps(status) {
  const steps = [
    { label: 'Order Placed', description: 'Your order has been received.' },
    { label: 'Processing', description: 'Your books are being prepared.' },
    { label: 'Shipped', description: 'Your package is on its way.' },
    {
      label: 'Out for Delivery',
      description: 'Your package is on its final journey.',
    },
    { label: 'Delivered', description: 'Your books have arrived.' },
  ]

  const normalizedStatus = String(status || 'Processing').toLowerCase()

  if (
    normalizedStatus === 'cancelled' ||
    normalizedStatus === 'canceled'
  ) {
    return { steps, currentStep: -1, cancelled: true }
  }

  const statusMap = {
    pending: 0,
    placed: 0,
    'order placed': 0,
    processing: 1,
    shipped: 2,
    'out for delivery': 3,
    delivered: 4,
  }

  return {
    steps,
    currentStep: statusMap[normalizedStatus] ?? 1,
    cancelled: false,
  }
}

function TrackingTimeline({ status }) {
  const { steps, currentStep, cancelled } = getTrackingSteps(status)

  if (cancelled) {
    return (
      <div className="border border-red-400/20 bg-red-400/5 p-5">
        <p className="flex items-center gap-2 text-sm text-red-300">
          <XCircle size={17} />
          This order has been cancelled.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const completed = index <= currentStep
        const current = index === currentStep

        return (
          <div key={step.label} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center border ${
                  completed
                    ? 'border-luxury-gold bg-luxury-gold text-luxury-black'
                    : 'border-white/15 text-luxury-muted'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle2 size={17} />
                ) : index === 4 ? (
                  <Package size={17} />
                ) : index === 2 || index === 3 ? (
                  <Truck size={17} />
                ) : (
                  <ShoppingBag size={17} />
                )}
              </div>

              {index !== steps.length - 1 && (
                <div
                  className={`my-1 min-h-8 w-px ${
                    index < currentStep
                      ? 'bg-luxury-gold'
                      : 'bg-white/10'
                  }`}
                />
              )}
            </div>

            <div className="pb-7">
              <p
                className={`text-sm ${
                  current
                    ? 'font-semibold text-luxury-gold'
                    : completed
                      ? 'text-luxury-ivory'
                      : 'text-luxury-muted'
                }`}
              >
                {step.label}

                {current && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider">
                    Current
                  </span>
                )}
              </p>

              <p className="mt-1 text-xs leading-5 text-luxury-muted">
                {step.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DetailRow({ label, value, emphasize = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-sm text-luxury-muted">{label}</span>

      <span
        className={`text-right text-sm ${
          emphasize
            ? 'font-editorial text-xl text-luxury-ivory'
            : 'text-luxury-ivory'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

export default function OrderDetailsPage() {
  const { orderId } = useParams()
  const { refreshCart } = useCart()

  const [orders, setOrders] = useState(readOrders)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [showCancelConfirmation, setShowCancelConfirmation] =
    useState(false)

  const order = orders.find(
    (item) => String(item.id) === String(orderId),
  )

  function handleCancelOrder() {
    setError('')
    setNotice('')

    if (!order || !canCancelOrder(order.status)) {
      setError('This order can no longer be cancelled.')
      setShowCancelConfirmation(false)
      return
    }

    try {
      const updatedOrders = orders.map((item) =>
        String(item.id) === String(orderId)
          ? {
              ...item,
              status: 'Cancelled',
              cancelledAt: new Date().toISOString(),
            }
          : item,
      )

      saveOrders(updatedOrders)
      setOrders(updatedOrders)
      setShowCancelConfirmation(false)
      setNotice('Your order has been cancelled successfully.')
    } catch {
      setError('Unable to cancel this order. Please try again.')
    }
  }

  function handleBuyAgain() {
    setError('')
    setNotice('')

    if (!order || !Array.isArray(order.items) || order.items.length === 0) {
      setError('No purchased book details are available to reorder.')
      return
    }

    try {
      const currentCart = JSON.parse(
        localStorage.getItem('smartbook-cart') || '[]',
      )

      if (!Array.isArray(currentCart)) {
        throw new Error('Invalid cart data')
      }

      const updatedCart = [...currentCart]

      for (const purchasedItem of order.items) {
        if (!purchasedItem || typeof purchasedItem !== 'object') {
          continue
        }

        const book = books.find(
          (entry) =>
            String(entry.id) === String(purchasedItem.id),
        )

        if (!book) continue

        const quantity = Math.max(
          1,
          Number(purchasedItem.quantity) || 1,
        )

        const existingItem = updatedCart.find(
          (entry) => String(entry.id) === String(book.id),
        )

        if (existingItem) {
          existingItem.quantity =
            Math.max(1, Number(existingItem.quantity) || 1) +
            quantity
        } else {
          updatedCart.push({
            ...book,
            quantity,
          })
        }
      }

      localStorage.setItem('smartbook-cart', JSON.stringify(updatedCart))

      if (typeof refreshCart === 'function') {
        refreshCart()
      }

      window.location.assign('/cart')
    } catch {
      setError(
        'Unable to add these books to your cart. Please try again.',
      )
    }
  }

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-luxury-black px-4 py-16 text-luxury-ivory">
        <div className="w-full max-w-lg border border-white/10 bg-luxury-surface p-8 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center border border-luxury-gold/25 text-luxury-gold">
            <Package size={28} />
          </div>

          <h1 className="mt-6 font-editorial text-3xl">
            Order Not Found
          </h1>

          <p className="mt-3 text-sm leading-7 text-luxury-muted">
            We couldn't find this order in your saved orders. It may
            have been removed or may belong to a different browser.
          </p>

          <Link
            to="/account"
            className="mt-7 inline-flex items-center gap-2 bg-luxury-gold px-6 py-3 text-sm font-semibold text-luxury-black transition hover:bg-luxury-ivory"
          >
            <ArrowLeft size={16} />
            Back to My Account
          </Link>
        </div>
      </main>
    )
  }

  const items = Array.isArray(order.items) ? order.items : []

  const subtotal = Number(
    order.subtotal ??
      items.reduce(
        (sum, item) =>
          sum +
          (Number(item.lineTotal) ||
            Number(item.price || 0) * Number(item.quantity || 1)),
        0,
      ),
  )

  const deliveryCharge = Number(order.deliveryCharge || 0)
  const total = Number(order.total ?? subtotal + deliveryCharge)
  const customer = order.customer || {}
  const cancellable = canCancelOrder(order.status)

  return (
    <main className="min-h-screen bg-luxury-black px-4 py-10 text-luxury-ivory sm:px-6 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/account"
          className="inline-flex items-center gap-2 text-sm text-luxury-muted transition hover:text-luxury-gold"
        >
          <ArrowLeft size={16} />
          Back to My Account
        </Link>

        <header className="mt-8 border-b border-white/10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-luxury-gold">
            Your Purchase
          </p>

          <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-editorial text-3xl sm:text-5xl">
                Order Details
              </h1>

              <p className="mt-3 break-all text-sm text-luxury-muted">
                Order #{order.id}
              </p>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 border px-3 py-2 text-xs uppercase tracking-wider ${
                String(order.status).toLowerCase() === 'cancelled'
                  ? 'border-red-400/25 text-red-300'
                  : 'border-luxury-gold/25 text-luxury-gold'
              }`}
            >
              <Clock3 size={14} />
              {order.status || 'Processing'}
            </span>
          </div>

          <p className="mt-4 text-sm text-luxury-muted">
            Placed on {formatDate(order.createdAt || order.date)}
          </p>
        </header>

        {notice && (
          <div
            role="status"
            className="mt-6 border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-300"
          >
            {notice}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {showCancelConfirmation && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-order-title"
          >
            <div className="w-full max-w-md border border-white/10 bg-luxury-surface p-6 sm:p-8">
              <XCircle size={28} className="text-red-300" />

              <h2
                id="cancel-order-title"
                className="mt-4 font-editorial text-2xl"
              >
                Cancel this order?
              </h2>

              <p className="mt-3 text-sm leading-6 text-luxury-muted">
                Are you sure you want to cancel order #{order.id}?
                This demo action updates the order saved in this browser.
              </p>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowCancelConfirmation(false)}
                  className="flex-1 border border-white/15 px-4 py-3 text-sm transition hover:border-white/30"
                >
                  Keep Order
                </button>

                <button
                  type="button"
                  onClick={handleCancelOrder}
                  className="flex-1 bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)]">
          <div className="space-y-8">
            <section className="border border-white/10 bg-luxury-surface p-5 sm:p-7">
              <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-5">
                <BookOpen size={21} className="text-luxury-gold" />

                <div>
                  <h2 className="font-editorial text-2xl">
                    Items Ordered
                  </h2>

                  <p className="mt-1 text-xs text-luxury-muted">
                    {items.length} {items.length === 1 ? 'book' : 'books'} in this order
                  </p>
                </div>
              </div>

              {items.length > 0 ? (
                <div className="divide-y divide-white/10">
                  {items.map((item, index) => {
                    const quantity = Math.max(1, Number(item.quantity) || 1)
                    const lineTotal = Number(
                      item.lineTotal ??
                        Number(item.price || 0) * quantity,
                    )

                    return (
                      <div
                        key={`${item.id || item.title || 'book'}-${index}`}
                        className="flex items-start justify-between gap-4 py-5 first:pt-0 last:pb-0"
                      >
                        <div className="flex min-w-0 gap-4">
                          <div className="flex h-16 w-12 shrink-0 items-center justify-center border border-luxury-gold/20 bg-luxury-black">
                            <BookOpen size={20} className="text-luxury-gold" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="break-words text-sm font-medium">
                              {item.title || item.name || 'Book'}
                            </h3>

                            <p className="mt-1 text-xs text-luxury-muted">
                              {item.author || 'Author unavailable'}
                            </p>

                            <p className="mt-2 text-xs text-luxury-muted">
                              Quantity: {quantity}
                            </p>

                            <p className="mt-1 text-xs text-luxury-muted">
                              {formatPrice(item.price)} each
                            </p>
                          </div>
                        </div>

                        <p className="shrink-0 text-sm text-luxury-ivory">
                          {formatPrice(lineTotal)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-luxury-muted">
                  No item details are available for this order.
                </p>
              )}
            </section>

            <section className="border border-white/10 bg-luxury-surface p-5 sm:p-7">
              <div className="mb-7 flex items-center gap-3">
                <Truck size={21} className="text-luxury-gold" />

                <div>
                  <h2 className="font-editorial text-2xl">
                    Order Tracking
                  </h2>

                  <p className="mt-1 text-xs text-luxury-muted">
                    Follow your order's progress.
                  </p>
                </div>
              </div>

              <TrackingTimeline status={order.status || 'Processing'} />

              <p className="border-t border-white/10 pt-4 text-xs leading-6 text-luxury-muted">
                Tracking stages are a frontend preview. Live shipping
                updates will require integration with the backend or a
                delivery service.
              </p>
            </section>

            <section className="border border-white/10 bg-luxury-surface p-5 sm:p-7">
              <h2 className="font-editorial text-2xl">Order Actions</h2>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleBuyAgain}
                  className="inline-flex flex-1 items-center justify-center gap-2 bg-luxury-gold px-5 py-3.5 text-sm font-semibold text-luxury-black transition hover:bg-luxury-ivory"
                >
                  <ShoppingBag size={16} />
                  Buy Again
                </button>

                {cancellable && (
                  <button
                    type="button"
                    onClick={() => {
                      setError('')
                      setShowCancelConfirmation(true)
                    }}
                    className="inline-flex flex-1 items-center justify-center gap-2 border border-red-400/30 px-5 py-3.5 text-sm text-red-300 transition hover:bg-red-400/10"
                  >
                    <XCircle size={16} />
                    Cancel Order
                  </button>
                )}
              </div>

              {!cancellable && (
                <p className="mt-4 text-xs leading-6 text-luxury-muted">
                  This order is no longer eligible for cancellation.
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="border border-white/10 bg-luxury-surface p-5 sm:p-6">
              <h2 className="font-editorial text-2xl">Order Summary</h2>

              <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
                <DetailRow label="Subtotal" value={formatPrice(subtotal)} />

                <DetailRow
                  label="Delivery"
                  value={deliveryCharge === 0 ? 'Free' : formatPrice(deliveryCharge)}
                />

                <DetailRow
                  label="Payment Method"
                  value={order.paymentMethod || 'Not specified'}
                />

                <DetailRow
                  label="Order Total"
                  value={formatPrice(total)}
                  emphasize
                />
              </div>

              <div className="mt-5 flex items-start gap-3 text-xs leading-6 text-luxury-muted">
                <ShieldCheck size={17} className="mt-0.5 shrink-0 text-luxury-gold" />

                <p>
                  This summary reflects the order information saved
                  when the order was placed.
                </p>
              </div>
            </section>

            <section className="border border-white/10 bg-luxury-surface p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <MapPin size={20} className="text-luxury-gold" />

                <h2 className="font-editorial text-2xl">Delivery Details</h2>
              </div>

              {customer.fullName || customer.address || customer.city ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-xs text-luxury-muted">Recipient</p>
                    <p className="mt-1">{customer.fullName || 'Not provided'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-luxury-muted">Address</p>

                    <p className="mt-1 leading-6">
                      {[
                        customer.address,
                        customer.city,
                        customer.state,
                        customer.pincode,
                      ]
                        .filter(Boolean)
                        .join(', ') || 'No address provided'}
                    </p>
                  </div>

                  {customer.phone && (
                    <div>
                      <p className="text-xs text-luxury-muted">Phone</p>
                      <p className="mt-1">{customer.phone}</p>
                    </div>
                  )}

                  {customer.email && (
                    <div>
                      <p className="text-xs text-luxury-muted">Email</p>
                      <p className="mt-1 break-all">{customer.email}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm leading-6 text-luxury-muted">
                  Delivery information is not available for this order.
                </p>
              )}
            </section>

            <Link
              to="/books"
              className="flex w-full items-center justify-center gap-2 border border-luxury-gold/30 px-5 py-4 text-sm text-luxury-gold transition hover:bg-luxury-gold hover:text-luxury-black"
            >
              Continue Shopping
              <ArrowRight size={16} />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  )
}
