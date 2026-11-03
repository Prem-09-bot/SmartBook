import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CreditCard,
  MapPin,
  ShieldCheck,
  Smartphone,
  Truck,
  Wallet,
  Tag,
  X,
} from 'lucide-react'

import { books } from '../data/books'
import { useCart } from '../context/CartContext'

const ORDERS_KEY = 'smartbook-orders'
const PROFILE_KEY = 'smartbook-profile'

const DELIVERY_CHARGE = 49
const FREE_DELIVERY_LIMIT = 999

// Demo coupons (frontend only)
const DEMO_COUPONS = [
  {
    code: 'WELCOME10',
    type: 'Percentage',
    value: 10,
    minOrder: 499,
    maxDiscount: 200,
    active: true,
  },
  {
    code: 'BOOKLOVE20',
    type: 'Percentage',
    value: 20,
    minOrder: 999,
    maxDiscount: 300,
    active: true,
  },
  {
    code: 'FLAT100',
    type: 'Fixed',
    value: 100,
    minOrder: 799,
    maxDiscount: 100,
    active: true,
  },
  {
    code: 'NEWUSER50',
    type: 'Fixed',
    value: 50,
    minOrder: 299,
    maxDiscount: 50,
    active: true,
  },
]

function formatPrice(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

function getBook(item) {
  return books.find((book) => book.id === item.id)
}

function readProfile() {
  try {
    const savedProfile = JSON.parse(
      localStorage.getItem(PROFILE_KEY) || 'null',
    )

    if (!savedProfile || typeof savedProfile !== 'object') {
      return {
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
      }
    }

    return {
      name: typeof savedProfile.name === 'string' ? savedProfile.name : '',
      email: typeof savedProfile.email === 'string' ? savedProfile.email : '',
      phone: typeof savedProfile.phone === 'string' ? savedProfile.phone : '',
      address: typeof savedProfile.address === 'string' ? savedProfile.address : '',
      city: typeof savedProfile.city === 'string' ? savedProfile.city : '',
      state: typeof savedProfile.state === 'string' ? savedProfile.state : '',
      pincode: typeof savedProfile.pincode === 'string' ? savedProfile.pincode : '',
    }
  } catch {
    return {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
    }
  }
}

function readOrders() {
  try {
    const savedOrders = JSON.parse(
      localStorage.getItem(ORDERS_KEY) || '[]',
    )

    return Array.isArray(savedOrders) ? savedOrders : []
  } catch {
    return []
  }
}

export default function CheckoutPage() {
  const { cartItems, setCartItems } = useCart()

  // Prefill contact details from Account Settings.
  const [form, setForm] = useState(() => {
    const profile = readProfile()

    return {
      fullName: profile.name,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      pincode: profile.pincode,
    }
  })

  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [errors, setErrors] = useState({})
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)
  const [orderError, setOrderError] = useState('')

  // Coupon states
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponMessage, setCouponMessage] = useState('')
  const [couponError, setCouponError] = useState(false)

  // Match cart items with the local book catalogue.
  const validItems = cartItems
    .map((item) => {
      const book = getBook(item)

      if (!book) return null

      const quantity = Math.max(
        1,
        Math.min(99, Math.floor(Number(item.quantity) || 1)),
      )

      return {
        ...book,
        quantity,
        lineTotal: book.price * quantity,
      }
    })
    .filter(Boolean)

  const subtotal = validItems.reduce(
    (total, item) => total + item.lineTotal,
    0,
  )

  const deliveryCharge =
    subtotal === 0 || subtotal >= FREE_DELIVERY_LIMIT
      ? 0
      : DELIVERY_CHARGE

  // Coupon discount
  const discount = appliedCoupon?.discount || 0

  const total = Math.max(
    0,
    subtotal + deliveryCharge - discount,
  )

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    setErrors((current) => ({
      ...current,
      [name]: '',
    }))

    setOrderError('')
  }

  // Apply coupon
  function handleApplyCoupon() {
    setCouponMessage('')
    setCouponError(false)

    if (appliedCoupon) {
      setCouponMessage('Remove the current coupon before applying another.')
      setCouponError(true)
      return
    }

    const normalizedCode = couponCode.trim().toUpperCase()

    if (!normalizedCode) {
      setCouponMessage('Please enter a coupon code.')
      setCouponError(true)
      return
    }

    const coupon = DEMO_COUPONS.find(
      (item) => item.code === normalizedCode && item.active,
    )

    if (!coupon) {
      setCouponMessage('Invalid or inactive coupon code.')
      setCouponError(true)
      return
    }

    if (subtotal < coupon.minOrder) {
      setCouponMessage(
        `Add ${formatPrice(coupon.minOrder - subtotal)} more to use this coupon.`,
      )
      setCouponError(true)
      return
    }

    let couponDiscount = 0

    if (coupon.type === 'Percentage') {
      couponDiscount = (subtotal * coupon.value) / 100

      if (coupon.maxDiscount > 0) {
        couponDiscount = Math.min(
          couponDiscount,
          coupon.maxDiscount,
        )
      }
    } else {
      couponDiscount = coupon.value
    }

    couponDiscount = Math.min(couponDiscount, subtotal)

    setAppliedCoupon({
      ...coupon,
      discount: couponDiscount,
    })

    setCouponCode(normalizedCode)

    setCouponMessage(
      `Coupon applied successfully! You saved ${formatPrice(couponDiscount)}.`,
    )

    setCouponError(false)
  }

  // Remove coupon
  function handleRemoveCoupon() {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponMessage('')
    setCouponError(false)
  }

  function validateForm() {
    const nextErrors = {}

    if (form.fullName.trim().length < 2) {
      nextErrors.fullName = 'Please enter your full name.'
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = 'Please enter a valid email address.'
    }

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      nextErrors.phone =
        'Enter a valid 10-digit Indian mobile number.'
    }

    if (form.address.trim().length < 5) {
      nextErrors.address =
        'Please enter a complete delivery address.'
    }

    if (!form.city.trim()) {
      nextErrors.city = 'Please enter your city.'
    }

    if (!form.state.trim()) {
      nextErrors.state = 'Please enter your state.'
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      nextErrors.pincode = 'Enter a valid 6-digit PIN code.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  function handlePlaceOrder(event) {
    event.preventDefault()
    setOrderError('')

    if (validItems.length === 0) {
      setOrderError(
        'Your cart has no valid books. Please return to the shop and add a book.',
      )
      return
    }

    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
      return
    }

    // Create a demo order.
    const order = {
      id: `SB${Date.now().toString().slice(-8)}`,

      customer: {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      },

      items: validItems.map((item) => ({
        id: item.id,
        title: item.title,
        author: item.author,
        price: item.price,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      })),

      subtotal,
      deliveryCharge,
      discount,
      couponCode: appliedCoupon?.code || null,
      total,
      paymentMethod,
      status: 'Processing',
      createdAt: new Date().toISOString(),
    }

    // Save the order before clearing the cart.
    try {
      const existingOrders = readOrders()
      const updatedOrders = [order, ...existingOrders]

      localStorage.setItem(
        ORDERS_KEY,
        JSON.stringify(updatedOrders),
      )

      setPlacedOrder(order)
      setOrderPlaced(true)

      // Clear cart after successfully saving the demo order.
      setCartItems([])
    } catch (error) {
      console.error('Unable to save demo order:', error)

      setOrderError(
        'We could not save your order in this browser. Please check your browser storage and try again.',
      )
    }
  }

  function renderError(field) {
    if (!errors[field]) return null

    return (
      <p className="mt-2 text-xs text-red-400" role="alert">
        {errors[field]}
      </p>
    )
  }

  const inputClass =
    'w-full border border-white/15 bg-luxury-black px-4 py-3.5 text-sm text-luxury-ivory outline-none transition placeholder:text-luxury-muted/50 focus:border-luxury-gold'

  const labelClass = 'mb-2 block text-sm text-luxury-ivory'

  // Order confirmation screen.
  if (orderPlaced && placedOrder) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-luxury-black px-4 py-16 text-luxury-ivory">
        <div className="w-full max-w-xl border border-white/10 bg-luxury-surface p-7 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
            <CheckCircle2 size={32} />
          </div>

          <p className="mt-7 text-xs uppercase tracking-[0.25em] text-luxury-gold">
            Checkout Demo Complete
          </p>

          <h1 className="mt-4 font-editorial text-3xl sm:text-4xl">
            Thank You for Your Order
          </h1>

          <p className="mt-4 text-sm leading-7 text-luxury-muted">
            Your demo order has been saved in this browser. You can
            view it in your Account Dashboard under My Orders.
            No real payment has been processed.
          </p>

          <div className="my-8 border border-white/10 p-5 text-left">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-luxury-muted">
                Demo Order ID
              </span>

              <span className="text-sm font-medium">
                {placedOrder.id}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
              <span className="text-xs text-luxury-muted">
                Order Status
              </span>

              <span className="text-sm text-emerald-300">
                {placedOrder.status}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
              <span className="text-xs text-luxury-muted">
                Payment Method
              </span>

              <span className="text-sm">
                {placedOrder.paymentMethod === 'cod'
                  ? 'Cash on Delivery'
                  : placedOrder.paymentMethod === 'upi'
                    ? 'UPI'
                    : 'Credit / Debit Card'}
              </span>
            </div>

            {placedOrder.couponCode && (
              <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                <span className="text-xs text-luxury-muted">
                  Coupon Applied
                </span>

                <span className="text-sm text-emerald-300">
                  {placedOrder.couponCode} (-{formatPrice(placedOrder.discount)})
                </span>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
              <span className="text-xs text-luxury-muted">
                Total
              </span>

              <span className="font-editorial text-2xl text-luxury-gold">
                {formatPrice(placedOrder.total)}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/account"
              className="inline-flex items-center justify-center gap-2 border border-luxury-gold px-6 py-4 text-sm transition hover:bg-white/5"
            >
              View My Orders
            </Link>

            <Link
              to="/books"
              className="inline-flex items-center justify-center gap-2 bg-luxury-gold px-6 py-4 text-sm font-semibold text-luxury-black transition hover:bg-luxury-ivory"
            >
              Continue Exploring
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Empty cart screen.
  if (validItems.length === 0) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-luxury-black px-4 py-16 text-luxury-ivory">
        <div className="max-w-md text-center">
          <BookOpen
            size={42}
            strokeWidth={1}
            className="mx-auto text-luxury-gold"
          />

          <h1 className="mt-6 font-editorial text-3xl">
            Your Cart Is Empty
          </h1>

          <p className="mt-3 text-sm leading-7 text-luxury-muted">
            Add some books to your cart before proceeding to checkout.
          </p>

          <Link
            to="/books"
            className="mt-7 inline-flex items-center gap-2 bg-luxury-gold px-6 py-3.5 text-sm font-semibold text-luxury-black transition hover:bg-luxury-ivory"
          >
            Discover Books
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-luxury-black px-4 py-10 text-luxury-ivory sm:px-6 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-[1300px]">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm text-luxury-muted transition hover:text-luxury-gold"
        >
          <ArrowLeft size={16} />
          Back to Cart
        </Link>

        <div className="mb-10 mt-8 border-b border-white/10 pb-8">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-luxury-gold">
            Almost Yours
          </p>

          <h1 className="font-editorial text-4xl sm:text-5xl">
            Checkout
          </h1>

          <p className="mt-4 text-sm leading-7 text-luxury-muted">
            Complete your delivery details and review your order.
          </p>
        </div>

        <form onSubmit={handlePlaceOrder} noValidate>
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_390px] xl:gap-12">
            {/* Delivery address */}
            <div className="space-y-8">
              <section className="border border-white/10 bg-luxury-surface p-5 sm:p-8">
                <div className="mb-7 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-luxury-gold/25 text-luxury-gold">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <h2 className="font-editorial text-2xl">
                      Delivery Address
                    </h2>

                    <p className="mt-1 text-xs text-luxury-muted">
                      Where should we send your books?
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="fullName" className={labelClass}>
                      Full Name *
                    </label>

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className={inputClass}
                      aria-invalid={Boolean(errors.fullName)}
                    />

                    {renderError('fullName')}
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email Address *
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={inputClass}
                      aria-invalid={Boolean(errors.email)}
                    />

                    {renderError('email')}
                  </div>

                  <div>
                    <label htmlFor="phone" className={labelClass}>
                      Mobile Number *
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      autoComplete="tel"
                      className={inputClass}
                      aria-invalid={Boolean(errors.phone)}
                    />

                    {renderError('phone')}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address" className={labelClass}>
                      House No. / Street Address *
                    </label>

                    <textarea
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="House number, street, locality"
                      autoComplete="street-address"
                      rows={3}
                      className={`${inputClass} resize-y`}
                      aria-invalid={Boolean(errors.address)}
                    />

                    {renderError('address')}
                  </div>

                  <div>
                    <label htmlFor="city" className={labelClass}>
                      City *
                    </label>

                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Your city"
                      autoComplete="address-level2"
                      className={inputClass}
                      aria-invalid={Boolean(errors.city)}
                    />

                    {renderError('city')}
                  </div>

                  <div>
                    <label htmlFor="state" className={labelClass}>
                      State *
                    </label>

                    <input
                      id="state"
                      name="state"
                      type="text"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="Your state"
                      autoComplete="address-level1"
                      className={inputClass}
                      aria-invalid={Boolean(errors.state)}
                    />

                    {renderError('state')}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="pincode" className={labelClass}>
                      PIN Code *
                    </label>

                    <input
                      id="pincode"
                      name="pincode"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="6-digit PIN code"
                      autoComplete="postal-code"
                      className={inputClass}
                      aria-invalid={Boolean(errors.pincode)}
                    />

                    {renderError('pincode')}
                  </div>
                </div>
              </section>

              {/* Payment options */}
              <section className="border border-white/10 bg-luxury-surface p-5 sm:p-8">
                <div className="mb-7 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-luxury-gold/25 text-luxury-gold">
                    <Wallet size={19} />
                  </div>

                  <div>
                    <h2 className="font-editorial text-2xl">
                      Payment Method
                    </h2>

                    <p className="mt-1 text-xs text-luxury-muted">
                      Choose your preferred payment option.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: 'cod',
                      title: 'Cash on Delivery',
                      description: 'Pay when your order arrives.',
                      icon: Truck,
                    },
                    {
                      id: 'upi',
                      title: 'UPI Payment',
                      description:
                        'Google Pay, PhonePe, or another UPI app.',
                      icon: Smartphone,
                    },
                    {
                      id: 'card',
                      title: 'Credit / Debit Card',
                      description:
                        'Visa, Mastercard, or other supported cards.',
                      icon: CreditCard,
                    },
                  ].map((method) => {
                    const Icon = method.icon
                    const selected = paymentMethod === method.id

                    return (
                      <label
                        key={method.id}
                        className={`flex cursor-pointer items-start gap-4 border p-4 transition sm:p-5 ${
                          selected
                            ? 'border-luxury-gold/60 bg-luxury-gold/5'
                            : 'border-white/10 hover:border-white/25'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selected}
                          onChange={() => setPaymentMethod(method.id)}
                          className="mt-1 accent-[#C6A66B]"
                        />

                        <Icon
                          size={20}
                          strokeWidth={1.5}
                          className={`mt-0.5 shrink-0 ${
                            selected
                              ? 'text-luxury-gold'
                              : 'text-luxury-muted'
                          }`}
                        />

                        <span className="min-w-0">
                          <span className="block text-sm font-medium">
                            {method.title}
                          </span>

                          <span className="mt-1 block text-xs leading-5 text-luxury-muted">
                            {method.description}
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>

                <p className="mt-5 border border-white/10 px-4 py-3 text-xs leading-5 text-luxury-muted">
                  Payment options are for UI demonstration only.
                  No payment will be collected in this frontend version.
                </p>
              </section>
            </div>

            {/* Order summary */}
            <aside className="lg:sticky lg:top-24">
              <section className="border border-white/10 bg-luxury-surface p-5 sm:p-7">
                <h2 className="font-editorial text-2xl">
                  Order Summary
                </h2>

                <p className="mt-2 text-xs text-luxury-muted">
                  {validItems.reduce(
                    (count, item) => count + item.quantity,
                    0,
                  )}{' '}
                  book(s) in your order
                </p>

                <div className="my-6 max-h-[340px] space-y-5 overflow-y-auto pr-1">
                  {validItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div
                        className="flex h-24 w-[68px] shrink-0 items-center justify-center p-2 text-center"
                        style={{
                          backgroundColor: item.coverColor,
                          color: item.coverAccent,
                        }}
                      >
                        <span className="font-editorial text-[9px] leading-4">
                          {item.coverText || item.title}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm leading-5">
                          {item.title}
                        </h3>

                        <p className="mt-1 text-xs text-luxury-muted">
                          {item.author}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-xs text-luxury-muted">
                            Qty: {item.quantity}
                          </span>

                          <span className="text-sm text-luxury-gold">
                            {formatPrice(item.lineTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon section */}
                <div className="mb-6 border border-white/10 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Tag size={16} className="text-luxury-gold" />

                    <h3 className="text-sm font-medium">
                      Apply Coupon
                    </h3>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between gap-3 border border-emerald-400/30 bg-emerald-400/5 p-3">
                      <div>
                        <p className="text-sm font-semibold text-emerald-300">
                          {appliedCoupon.code}
                        </p>

                        <p className="mt-1 text-xs text-luxury-muted">
                          You saved {formatPrice(discount)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="flex h-8 w-8 items-center justify-center text-luxury-muted transition hover:text-red-400"
                        aria-label="Remove coupon"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(event) => {
                          setCouponCode(event.target.value.toUpperCase())
                          setCouponMessage('')
                          setCouponError(false)
                        }}
                        placeholder="Enter coupon code"
                        className="min-w-0 flex-1 border border-white/15 bg-luxury-black px-3 py-2.5 text-xs text-luxury-ivory outline-none transition placeholder:text-luxury-muted/50 focus:border-luxury-gold"
                      />

                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="shrink-0 bg-luxury-gold px-4 py-2.5 text-xs font-semibold text-luxury-black transition hover:bg-luxury-ivory"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {couponMessage && (
                    <p
                      role="status"
                      className={`mt-3 text-xs leading-5 ${
                        couponError
                          ? 'text-red-400'
                          : 'text-emerald-300'
                      }`}
                    >
                      {couponMessage}
                    </p>
                  )}

                  {!appliedCoupon && (
                    <div className="mt-3">
                      <p className="text-[10px] text-luxury-muted">
                        Demo codes:
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {DEMO_COUPONS.map((coupon) => (
                          <button
                            key={coupon.code}
                            type="button"
                            onClick={() => {
                              setCouponCode(coupon.code)
                              setCouponMessage('')
                              setCouponError(false)
                            }}
                            className="border border-luxury-gold/20 px-2 py-1 text-[10px] text-luxury-gold transition hover:border-luxury-gold/60"
                          >
                            {coupon.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price breakdown */}
                <div className="space-y-4 border-t border-white/10 pt-5">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-luxury-muted">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-luxury-muted">Delivery</span>

                    <span
                      className={
                        deliveryCharge === 0
                          ? 'text-emerald-300'
                          : ''
                      }
                    >
                      {deliveryCharge === 0
                        ? 'FREE'
                        : formatPrice(deliveryCharge)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-luxury-muted">
                        Coupon Discount ({appliedCoupon.code})
                      </span>

                      <span className="text-emerald-300">
                        -{formatPrice(discount)}
                      </span>
                    </div>
                  )}

                  {subtotal > 0 &&
                    subtotal < FREE_DELIVERY_LIMIT && (
                      <p className="text-xs leading-5 text-luxury-muted">
                        Add{' '}
                        {formatPrice(
                          FREE_DELIVERY_LIMIT - subtotal,
                        )}{' '}
                        more for free delivery.
                      </p>
                    )}

                  <div className="flex justify-between gap-4 border-t border-white/10 pt-5">
                    <span className="font-medium">Total</span>

                    <span className="font-editorial text-2xl text-luxury-gold">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {orderError && (
                  <p
                    role="alert"
                    className="mt-5 border border-red-400/30 bg-red-400/5 p-3 text-sm leading-6 text-red-300"
                  >
                    {orderError}
                  </p>
                )}

                <button
                  type="submit"
                  className="mt-7 flex w-full items-center justify-center gap-2 bg-luxury-gold px-5 py-4 text-sm font-semibold text-luxury-black transition hover:bg-luxury-ivory"
                >
                  Place Demo Order
                  <ArrowRight size={17} />
                </button>

                <div className="mt-5 flex items-start justify-center gap-2 text-center text-[11px] leading-5 text-luxury-muted">
                  <ShieldCheck
                    size={15}
                    className="mt-0.5 shrink-0 text-luxury-gold"
                  />

                  <p>
                    Demo checkout only. No real order or payment
                    is processed.
                  </p>
                </div>
              </section>

              <Link
                to="/books"
                className="mt-5 flex items-center justify-center gap-2 py-3 text-sm text-luxury-muted transition hover:text-luxury-gold"
              >
                Continue Shopping
                <ArrowLeft size={15} />
              </Link>
            </aside>
          </div>
        </form>
      </div>
    </main>
  )
}
