import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Heart,
  LogOut,
  Mail,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  UserRound,
} from 'lucide-react'

import { books } from '../data/books'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'

const ORDERS_KEY = 'smartbook-orders'
const PROFILE_KEY = 'smartbook-profile'

const DEFAULT_PROFILE = {
  name: 'SmartBook Reader',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
}

function readProfile() {
  try {
    const value = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null')

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return DEFAULT_PROFILE
    }

    return {
      ...DEFAULT_PROFILE,
      ...value,
    }
  } catch {
    return DEFAULT_PROFILE
  }
}


function readOrders() {
  try {
    const value = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString('en-IN')}`
}

function formatDate(dateValue) {
  if (!dateValue) return 'Date unavailable'

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return String(dateValue)
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getStatusStyles(status) {
  const normalizedStatus = String(status || '').toLowerCase()

  if (normalizedStatus === 'delivered') {
    return {
      icon: CheckCircle2,
      classes: 'border-emerald-400/20 text-emerald-300',
    }
  }

  if (
    normalizedStatus === 'cancelled' ||
    normalizedStatus === 'canceled' ||
    normalizedStatus === 'failed'
  ) {
    return {
      icon: Clock3,
      classes: 'border-red-400/20 text-red-300',
    }
  }

  return {
    icon: Clock3,
    classes: 'border-luxury-gold/25 text-luxury-gold',
  }
}

function StatusBadge({ status = 'Processing' }) {
  const { icon: Icon, classes } = getStatusStyles(status)

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] uppercase tracking-wider ${classes}`}
    >
      <Icon size={12} />
      {status}
    </span>
  )
}

function AccountNavigation({ activeTab, onTabChange }) {
  const items = [
    { id: 'overview', label: 'Overview', icon: UserRound },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ]

  return (
    <nav className="space-y-2">
      {items.map((item) => {
        const Icon = item.icon
        const active = activeTab === item.id

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition ${
              active
                ? 'border border-luxury-gold/25 bg-luxury-gold/10 text-luxury-gold'
                : 'border border-transparent text-luxury-muted hover:border-white/10 hover:text-luxury-ivory'
            }`}
          >
            <Icon size={17} strokeWidth={1.5} />
            {item.label}

            {active && (
              <ChevronRight size={15} className="ml-auto" />
            )}
          </button>
        )
      })}
    </nav>
  )
}

function OrderCard({ order, onCancelOrder, onBuyAgain }) {
  const items = Array.isArray(order.items) ? order.items : []

  const orderTotal = Number(
    order.total ??
      order.grandTotal ??
      items.reduce(
        (total, item) =>
          total +
          (Number(item.lineTotal) ||
            Number(item.price || 0) * Number(item.quantity || 1)),
        0,
      ),
  )

  const paymentMethod = order.paymentMethod || 'Not specified'
  const orderDate = formatDate(order.createdAt || order.date)

  return (
    <article className="border border-white/10 bg-luxury-surface p-5 transition hover:border-luxury-gold/20 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs uppercase tracking-wider text-luxury-gold">
            Order #{order.id || 'N/A'}
          </p>

          <p className="mt-2 text-xs text-luxury-muted">
            Placed on {orderDate}
          </p>
        </div>

        <StatusBadge status={order.status || 'Processing'} />
      </div>

      <div className="my-5 border-y border-white/10 py-4">
        <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-luxury-muted">
          Items in this order
        </p>

        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item, index) => {
              const title =
                typeof item === 'string'
                  ? item
                  : item.title || item.name || 'Book'

              const quantity =
                typeof item === 'string'
                  ? 1
                  : Math.max(1, Number(item.quantity) || 1)

              const lineTotal =
                typeof item === 'string'
                  ? null
                  : Number(
                      item.lineTotal ??
                        Number(item.price || 0) * quantity,
                    )

              return (
                <div
                  key={`${item.id || title}-${index}`}
                  className="flex items-start gap-3"
                >
                  <BookOpen
                    size={16}
                    className="mt-0.5 shrink-0 text-luxury-gold"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-luxury-ivory">
                      {title}
                    </p>

                    <p className="mt-1 text-xs text-luxury-muted">
                      Quantity: {quantity}
                    </p>
                  </div>

                  {lineTotal !== null && (
                    <span className="shrink-0 text-sm text-luxury-muted">
                      {formatPrice(lineTotal)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-luxury-muted">
            No item details are available for this order.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-luxury-muted">
            Payment method
          </p>

          <p className="mt-2 text-sm text-luxury-ivory">
            {paymentMethod}
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-[10px] uppercase tracking-[0.18em] text-luxury-muted">
            Order total
          </p>

          <p className="mt-1 font-editorial text-2xl text-luxury-ivory">
            {formatPrice(orderTotal)}
          </p>
        </div>
      </div>

      {order.customer?.address && (
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="flex items-start gap-2 text-xs leading-6 text-luxury-muted">
            <MapPin
              size={15}
              className="mt-1 shrink-0 text-luxury-gold"
            />

            <span>
              Delivery address:{' '}
              {[
                order.customer.address,
                order.customer.city,
                order.customer.state,
                order.customer.pincode,
              ]
                .filter(Boolean)
                .join(', ')}
            </span>
          </p>
        </div>
      )}

      <div className="mt-5 space-y-4 border-t border-white/10 pt-5">
  <p className="text-xs leading-6 text-luxury-muted">
    View your order details or manage this purchase.
  </p>

  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
    <Link
      to={`/orders/${encodeURIComponent(order.id || '')}`}
      className="inline-flex items-center justify-center gap-2 border border-luxury-gold/30 px-4 py-3 text-sm text-luxury-gold transition hover:bg-luxury-gold hover:text-luxury-black"
    >
      View Order Details
      <ArrowRight size={15} />
    </Link>

    <button
      type="button"
      onClick={() => onBuyAgain(order)}
      className="inline-flex items-center justify-center gap-2 border border-white/15 px-4 py-3 text-sm text-luxury-ivory transition hover:border-luxury-gold/40 hover:text-luxury-gold"
    >
      <ShoppingBag size={15} />
      Buy Again
    </button>

    {['pending', 'processing', 'placed', 'order placed'].includes(
      String(order.status || 'Processing').toLowerCase(),
    ) && (
      <button
        type="button"
        onClick={() => onCancelOrder(order)}
        className="inline-flex items-center justify-center gap-2 border border-red-400/25 px-4 py-3 text-sm text-red-300 transition hover:bg-red-400/10"
      >
        <Clock3 size={15} />
        Cancel Order
      </button>
    )}
  </div>
</div>
    </article>
  )
}

function EmptyOrders() {
  return (
    <div className="border border-white/10 bg-luxury-surface px-5 py-14 text-center sm:px-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center border border-luxury-gold/25 bg-luxury-black text-luxury-gold">
        <Package size={27} strokeWidth={1.4} />
      </div>

      <h3 className="mt-6 font-editorial text-2xl">
        Your story starts here.
      </h3>

      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-luxury-muted">
        You haven't placed an order yet. Explore our collection and
        discover your next favourite book.
      </p>

      <Link
        to="/books"
        className="mt-7 inline-flex items-center justify-center gap-2 bg-luxury-gold px-6 py-3.5 text-sm font-semibold text-luxury-black transition hover:bg-luxury-ivory"
      >
        Explore Books
        <ArrowRight size={16} />
      </Link>
    </div>
  )
}

export default function AccountPage() {
  const navigate = useNavigate()

  const { user, logout, isAuthenticated } = useAuth()

  const [activeTab, setActiveTab] = useState('overview')
 
const { wishlistItems } = useWishlist()
const [orders, setOrders] = useState(readOrders)

 const [profile, setProfile] = useState(() => {
  const savedProfile = readProfile()

  if (user) {
    return {
      ...savedProfile,
      name: user.name || savedProfile.name,
      email: user.email || savedProfile.email,
    }
  }

  return savedProfile
})

  const [notice, setNotice] = useState('')

  const { cartCount, refreshCart } = useCart()

  useEffect(() => {
    function syncOrders() {
      setOrders(readOrders())
    }

    window.addEventListener('storage', syncOrders)

    return () => {
      window.removeEventListener('storage', syncOrders)
    }
  }, [])

  const wishlistCount = wishlistItems.filter((item) =>
  books.some((book) => book.id === item.id),
).length

  function updateProfile(event) {
    const { name, value } = event.target

    setProfile((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleSaveProfile(event) {
    event.preventDefault()

    const cleanedProfile = {
      name: profile.name.trim(),
      email: profile.email.trim(),
      phone: profile.phone.trim(),
      address: profile.address.trim(),
      city: profile.city.trim(),
      state: profile.state.trim(),
      pincode: profile.pincode.trim(),
    }

    if (cleanedProfile.name.length < 2) {
      setNotice('Please enter a name with at least 2 characters.')
      return
    }

    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(cleanedProfile))
      setProfile(cleanedProfile)
      setNotice('Your profile has been saved on this device.')
    } catch {
      setNotice(
        'Your profile could not be saved. Check your browser storage settings and try again.',
      )
    }
  }

function handleLogout() {
  const confirmed = window.confirm(
    'Are you sure you want to sign out of your account?',
  )

  if (!confirmed) return

  logout()

  setNotice('You have been signed out successfully.')

  navigate('/login', { replace: true })
}
  function handleCancelOrder(order) {
  const cancellableStatuses = [
    'pending',
    'processing',
    'placed',
    'order placed',
  ]

  if (
    !cancellableStatuses.includes(
      String(order.status || 'Processing').toLowerCase(),
    )
  ) {
    setNotice('This order is no longer eligible for cancellation.')
    return
  }

  const confirmed = window.confirm(
    `Are you sure you want to cancel order #${order.id}?`,
  )

  if (!confirmed) return

  try {
    const currentOrders = readOrders()

    const updatedOrders = currentOrders.map((item) =>
      String(item.id) === String(order.id)
        ? {
            ...item,
            status: 'Cancelled',
            cancelledAt: new Date().toISOString(),
          }
        : item,
    )

    localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders))

    setOrders(updatedOrders)
    setNotice(`Order #${order.id} has been cancelled successfully.`)
  } catch {
    setNotice('Unable to cancel this order. Please try again.')
  }
}

function handleBuyAgain(order) {
  try {
    const purchasedItems = Array.isArray(order.items) ? order.items : []

    if (purchasedItems.length === 0) {
      setNotice('No book details are available for this order.')
      return
    }

    const savedCart = JSON.parse(
      localStorage.getItem('smartbook-cart') || '[]',
    )

    if (!Array.isArray(savedCart)) {
      throw new Error('Invalid cart data')
    }

    const updatedCart = [...savedCart]
    let addedCount = 0

    purchasedItems.forEach((item) => {
      if (!item || typeof item !== 'object') return

      const book = books.find(
        (entry) => String(entry.id) === String(item.id),
      )

      if (!book) return

      const quantity = Math.max(1, Number(item.quantity) || 1)

      const existingItem = updatedCart.find(
        (entry) => String(entry.id) === String(book.id),
      )

      if (existingItem) {
        existingItem.quantity =
          Math.max(1, Number(existingItem.quantity) || 1) + quantity
      } else {
        updatedCart.push({
          ...book,
          quantity,
        })
      }

      addedCount += 1
    })

    if (addedCount === 0) {
      setNotice(
        'The books from this order could not be found in the current catalogue.',
      )
      return
    }

    localStorage.setItem('smartbook-cart', JSON.stringify(updatedCart))

    if (typeof refreshCart === 'function') {
      refreshCart()
    }

    window.location.assign('/cart')
  } catch {
    setNotice('Unable to reorder these books. Please try again.')
  }
}

  function openTab(tab) {
    setActiveTab(tab)
    setNotice('')

    // Refresh local order data when opening the orders section.
    if (tab === 'orders' || tab === 'overview') {
      setOrders(readOrders())
    }
  }

  return (
    <main className="min-h-screen bg-luxury-black px-4 py-10 text-luxury-ivory sm:px-6 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        {/* Header */}
        <div className="mb-10 border-b border-white/10 pb-8 sm:mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-luxury-gold">
            Your Personal Space
          </p>

          <h1 className="font-editorial text-4xl sm:text-5xl">
            My Account
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-luxury-muted">
            Manage your reading journey, keep track of your orders,
            and organise your favourite books.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:gap-10">
          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="border border-white/10 bg-luxury-surface p-6">
              <div className="flex h-16 w-16 items-center justify-center border border-luxury-gold/30 bg-luxury-black font-editorial text-2xl text-luxury-gold">
                {profile.name.trim().charAt(0).toUpperCase() || 'R'}
              </div>

              <h2 className="mt-5 break-words font-editorial text-xl">
                {profile.name || 'SmartBook Reader'}
              </h2>

              <p className="mt-2 break-all text-xs text-luxury-muted">
                {profile.email || 'Your email address'}
              </p>

              <div className="mt-6 border-t border-white/10 pt-5">
                <AccountNavigation
                  activeTab={activeTab}
                  onTabChange={openTab}
                />
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-5 flex w-full items-center gap-3 border-t border-white/10 pt-5 text-sm text-luxury-muted transition hover:text-red-400"
              >
                <LogOut size={17} />
                Sign Out
              </button>
            </div>

            {/* Quick Links */}
            <div className="border border-white/10 bg-luxury-surface p-5">
              <p className="mb-4 text-xs uppercase tracking-[0.2em] text-luxury-gold">
                Quick Access
              </p>

              <div className="space-y-1">
                <Link
                  to="/wishlist"
                  className="flex items-center justify-between py-3 text-sm text-luxury-muted transition hover:text-luxury-ivory"
                >
                  <span className="flex items-center gap-3">
                    <Heart size={16} />
                    My Wishlist
                  </span>

                  <span>{wishlistCount}</span>
                </Link>

                <Link
                  to="/cart"
                  className="flex items-center justify-between border-t border-white/10 py-3 text-sm text-luxury-muted transition hover:text-luxury-ivory"
                >
                  <span className="flex items-center gap-3">
                    <ShoppingCart size={16} />
                    Shopping Cart
                  </span>

                  <span>{cartCount}</span>
                </Link>

                <Link
                  to="/books"
                  className="flex items-center justify-between border-t border-white/10 py-3 text-sm text-luxury-muted transition hover:text-luxury-ivory"
                >
                  <span className="flex items-center gap-3">
                    <BookOpen size={16} />
                    Browse Books
                  </span>

                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <section className="min-w-0">
            {notice && (
              <div
                role="status"
                className="mb-6 border border-luxury-gold/25 bg-luxury-surface p-4 text-sm leading-6 text-luxury-gold"
              >
                {notice}
              </div>
            )}

            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-editorial text-2xl sm:text-3xl">
                    Welcome, {profile.name.split(' ')[0] || 'Reader'}.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-luxury-muted">
                    Your reading collection, all in one place.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    {
                      label: 'Saved Books',
                      value: wishlistCount,
                      icon: Heart,
                      link: '/wishlist',
                    },
                    {
                      label: 'Cart Items',
                      value: cartCount,
                      icon: ShoppingBag,
                      link: '/cart',
                    },
                    {
                      label: 'Total Orders',
                      value: orders.length,
                      icon: Package,
                      link: null,
                      action: () => openTab('orders'),
                    },
                  ].map((stat) => {
                    const Icon = stat.icon

                    const content = (
                      <div className="h-full border border-white/10 bg-luxury-surface p-5 transition hover:border-luxury-gold/30 sm:p-6">
                        <Icon
                          size={21}
                          className="text-luxury-gold"
                          strokeWidth={1.5}
                        />

                        <p className="mt-5 font-editorial text-3xl">
                          {stat.value}
                        </p>

                        <p className="mt-2 text-xs text-luxury-muted">
                          {stat.label}
                        </p>
                      </div>
                    )

                    if (stat.link) {
                      return (
                        <Link key={stat.label} to={stat.link}>
                          {content}
                        </Link>
                      )
                    }

                    return (
                      <button
                        key={stat.label}
                        type="button"
                        onClick={stat.action}
                        className="text-left"
                      >
                        {content}
                      </button>
                    )
                  })}
                </div>

                <div>
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <h3 className="font-editorial text-2xl">
                      Recent Orders
                    </h3>

                    <button
                      type="button"
                      onClick={() => openTab('orders')}
                      className="flex shrink-0 items-center gap-2 text-xs text-luxury-gold transition hover:text-luxury-ivory"
                    >
                      View All
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  {orders.length > 0 ? (
                    <div className="space-y-4">
                     {orders.slice(0, 2).map((order, index) => (
  <OrderCard
    key={order.id || index}
    order={order}
    onCancelOrder={handleCancelOrder}
    onBuyAgain={handleBuyAgain}
  />
))}
                    </div>
                  ) : (
                    <EmptyOrders />
                  )}
                </div>

                <div className="border border-luxury-gold/20 bg-luxury-surface p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-luxury-gold/25 text-luxury-gold">
                      <BookOpen size={21} />
                    </div>

                    <div>
                      <h3 className="font-editorial text-2xl">
                        Your next chapter awaits.
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-luxury-muted">
                        Explore our library and find something
                        worth getting lost in.
                      </p>

                      <Link
                        to="/books"
                        className="mt-5 inline-flex items-center gap-2 text-sm text-luxury-gold transition hover:text-luxury-ivory"
                      >
                        Discover Books
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders */}
            {activeTab === 'orders' && (
              <div>
                <div className="mb-7">
                  <p className="mb-3 text-xs uppercase tracking-[0.2em] text-luxury-gold">
                    Your Purchases
                  </p>

                  <h2 className="font-editorial text-3xl">
                    My Orders
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-luxury-muted">
                    Review your purchases, payment methods, and order statuses.
                  </p>
                </div>

                {orders.length > 0 ? (
                  <>
                    <div className="mb-6 flex items-center justify-between gap-4 border border-white/10 bg-luxury-surface p-4">
                      <div className="flex items-center gap-3">
                        <Package
                          size={19}
                          className="text-luxury-gold"
                        />

                        <p className="text-sm text-luxury-muted">
                          {orders.length}{' '}
                          {orders.length === 1 ? 'order' : 'orders'} found
                        </p>
                      </div>

                      <span className="text-xs text-luxury-muted">
                        Sorted by latest
                      </span>
                    </div>

                    <div className="space-y-4">
                     {orders.map((order, index) => (
  <OrderCard
    key={order.id || index}
    order={order}
    onCancelOrder={handleCancelOrder}
    onBuyAgain={handleBuyAgain}
  />
))}
                    </div>
                  </>
                ) : (
                  <EmptyOrders />
                )}

                <p className="mt-5 text-xs leading-6 text-luxury-muted">
                  Orders placed using this frontend are stored in this
                  browser. Once the backend is connected, this section
                  can load your order history from the server.
                </p>
              </div>
            )}

            {/* Account Settings */}
            {activeTab === 'settings' && (
              <div>
                <div className="mb-7">
                  <p className="mb-3 text-xs uppercase tracking-[0.2em] text-luxury-gold">
                    Personalise Your Experience
                  </p>

                  <h2 className="font-editorial text-3xl">
                    Account Settings
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-luxury-muted">
                    Manage your personal information.
                  </p>
                </div>

                <form
                  onSubmit={handleSaveProfile}
                  className="space-y-6 border border-white/10 bg-luxury-surface p-5 sm:p-8"
                >
                  <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                    <UserRound
                      size={21}
                      className="text-luxury-gold"
                    />

                    <h3 className="font-editorial text-xl">
                      Personal Information
                    </h3>
                  </div>

                  <div>
                    <label
                      htmlFor="account-name"
                      className="mb-2 block text-sm"
                    >
                      Full Name
                    </label>

                    <input
                      id="account-name"
                      name="name"
                      type="text"
                      value={profile.name}
                      onChange={updateProfile}
                      required
                      minLength={2}
                      className="w-full border border-white/15 bg-luxury-black px-4 py-3 text-sm outline-none transition focus:border-luxury-gold"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="account-email"
                      className="mb-2 block text-sm"
                    >
                      Email Address
                    </label>

                    <div className="flex items-center border border-white/15 bg-luxury-black focus-within:border-luxury-gold">
                      <Mail
                        size={17}
                        className="ml-4 shrink-0 text-luxury-muted"
                      />

                      <input
                        id="account-email"
                        name="email"
                        type="email"
                        value={profile.email}
                        onChange={updateProfile}
                        placeholder="you@example.com"
                        className="w-full min-w-0 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-luxury-muted/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="account-phone"
                      className="mb-2 block text-sm"
                    >
                      Phone Number
                    </label>

                    <input
                      id="account-phone"
                      name="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={updateProfile}
                      placeholder="Enter your phone number"
                      className="w-full border border-white/15 bg-luxury-black px-4 py-3 text-sm outline-none transition focus:border-luxury-gold"
                    />
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <div className="mb-5 flex items-center gap-3">
                      <MapPin size={20} className="text-luxury-gold" />
                      <h3 className="font-editorial text-xl">Delivery Address</h3>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label htmlFor="account-address" className="mb-2 block text-sm">
                          Street Address
                        </label>
                        <input
                          id="account-address"
                          name="address"
                          type="text"
                          autoComplete="street-address"
                          value={profile.address}
                          onChange={updateProfile}
                          placeholder="House number, street, area"
                          className="w-full border border-white/15 bg-luxury-black px-4 py-3 text-sm outline-none transition focus:border-luxury-gold"
                        />
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="account-city" className="mb-2 block text-sm">
                            City
                          </label>
                          <input
                            id="account-city"
                            name="city"
                            type="text"
                            autoComplete="address-level2"
                            value={profile.city}
                            onChange={updateProfile}
                            placeholder="Your city"
                            className="w-full border border-white/15 bg-luxury-black px-4 py-3 text-sm outline-none transition focus:border-luxury-gold"
                          />
                        </div>

                        <div>
                          <label htmlFor="account-state" className="mb-2 block text-sm">
                            State
                          </label>
                          <input
                            id="account-state"
                            name="state"
                            type="text"
                            autoComplete="address-level1"
                            value={profile.state}
                            onChange={updateProfile}
                            placeholder="Your state"
                            className="w-full border border-white/15 bg-luxury-black px-4 py-3 text-sm outline-none transition focus:border-luxury-gold"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="account-pincode" className="mb-2 block text-sm">
                          PIN Code
                        </label>
                        <input
                          id="account-pincode"
                          name="pincode"
                          type="text"
                          inputMode="numeric"
                          autoComplete="postal-code"
                          maxLength={6}
                          value={profile.pincode}
                          onChange={updateProfile}
                          placeholder="6-digit PIN code"
                          className="w-full border border-white/15 bg-luxury-black px-4 py-3 text-sm outline-none transition focus:border-luxury-gold"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 bg-luxury-gold px-6 py-3.5 text-sm font-semibold text-luxury-black transition hover:bg-luxury-ivory"
                  >
                    Save Changes
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div className="mt-6 border border-white/10 bg-luxury-surface p-5 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-luxury-gold/25 text-luxury-gold">
                      <ShieldCheck size={21} />
                    </div>

                    <div>
                      <h3 className="font-editorial text-xl">
                        Security & Password
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-luxury-muted">
                        Password changes and account security will
                        be connected when the authentication API is ready.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border border-white/10 bg-luxury-surface p-5 sm:p-8">
                  <div className="flex items-start gap-4">
                    <MapPin
                      size={20}
                      className="mt-1 shrink-0 text-luxury-gold"
                    />

                    <div>
                      <h3 className="font-editorial text-xl">
                        Delivery Address
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-luxury-muted">
                        {[
                          profile.address,
                          profile.city,
                          profile.state,
                          profile.pincode,
                        ]
                          .filter(Boolean)
                          .join(', ') ||
                          'Add your delivery address in Account Settings to use it automatically at checkout.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}