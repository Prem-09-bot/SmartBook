import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const CartContext = createContext(null)

const CART_KEY = 'smartbook-cart'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '')

function readGuestCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function getToken() {
  return localStorage.getItem('smartbook-token')
}

async function apiRequest(path, options = {}) {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Request failed (${response.status})`)
  }

  return result
}

function normalizeItems(items = []) {
  return items.map((item) => ({
    ...item,
    id: item.slug || String(item.bookId),
    cartItemId: Number(item.cartItemId),
    bookId: Number(item.bookId),
    price: Number(item.price ?? item.unitPrice ?? 0),
    quantity: Number(item.quantity || 1),
    cover: item.coverImageUrl || item.cover || item.cover_image_url || '',
  }))
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(readGuestCart)
  const [isCartLoading, setIsCartLoading] = useState(false)

  const refreshCart = useCallback(async () => {
    if (!getToken()) {
      setCartItems(readGuestCart())
      return readGuestCart()
    }

    setIsCartLoading(true)

    try {
      const result = await apiRequest('/api/cart')
      const items = normalizeItems(result.data?.items || [])
      setCartItems(items)
      localStorage.setItem(CART_KEY, JSON.stringify(items))
      return items
    } finally {
      setIsCartLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCart().catch((error) => {
      console.error('Unable to load cart:', error.message)
    })
  }, [refreshCart])

  useEffect(() => {
    function handleStorage(event) {
      if (event.key === 'smartbook-token') {
        refreshCart().catch((error) => console.error(error.message))
      }

      if (event.key === CART_KEY && !getToken()) {
        setCartItems(readGuestCart())
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [refreshCart])

  const addToCartBySlug = useCallback(async (book, quantity = 1) => {
    if (!book?.id) throw new Error('Book information is missing.')

    if (!getToken()) {
      const current = readGuestCart()
      const existing = current.find((item) => item.id === book.id)

      const updated = existing
        ? current.map((item) =>
            item.id === book.id
              ? { ...item, quantity: Number(item.quantity || 1) + quantity }
              : item,
          )
        : [...current, { ...book, quantity }]

      setCartItems(updated)
      localStorage.setItem(CART_KEY, JSON.stringify(updated))
      return updated
    }

    const bookResult = await apiRequest(`/api/books/${encodeURIComponent(book.id)}`)
    const databaseBook = bookResult.data?.book || bookResult.data

    if (!databaseBook?.id) {
      throw new Error('Could not find this book in the database.')
    }

    await apiRequest('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({
        bookId: Number(databaseBook.id),
        quantity: Number(quantity),
      }),
    })

    return refreshCart()
  }, [refreshCart])

  const updateCartItem = useCallback(async (item, quantity) => {
    const nextQuantity = Number(quantity)

    if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
      throw new Error('Quantity must be at least 1.')
    }

    if (!getToken()) {
      const updated = cartItems.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: nextQuantity }
          : cartItem,
      )
      setCartItems(updated)
      localStorage.setItem(CART_KEY, JSON.stringify(updated))
      return updated
    }

    const cartItemId = Number(item.cartItemId)
    if (!cartItemId) throw new Error('Invalid cart item. Refresh your cart.')

    await apiRequest(`/api/cart/items/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: nextQuantity }),
    })

    return refreshCart()
  }, [cartItems, refreshCart])

  const removeCartItem = useCallback(async (item) => {
    if (!getToken()) {
      const updated = cartItems.filter((cartItem) => cartItem.id !== item.id)
      setCartItems(updated)
      localStorage.setItem(CART_KEY, JSON.stringify(updated))
      return updated
    }

    const cartItemId = Number(item.cartItemId)
    if (!cartItemId) throw new Error('Invalid cart item. Refresh your cart.')

    await apiRequest(`/api/cart/items/${cartItemId}`, {
      method: 'DELETE',
    })

    return refreshCart()
  }, [cartItems, refreshCart])

  const clearCart = useCallback(async () => {
    if (getToken()) {
      await apiRequest('/api/cart/clear', { method: 'DELETE' })
    }

    setCartItems([])
    localStorage.setItem(CART_KEY, '[]')
  }, [])

  const cartCount = useMemo(
    () => cartItems.reduce(
      (total, item) => total + Math.max(0, Number(item.quantity) || 0),
      0,
    ),
    [cartItems],
  )

  const value = useMemo(() => ({
    cartItems,
    setCartItems,
    cartCount,
    isCartLoading,
    refreshCart,
    addToCartBySlug,
    updateCartItem,
    removeCartItem,
    clearCart,
  }), [
    cartItems,
    cartCount,
    isCartLoading,
    refreshCart,
    addToCartBySlug,
    updateCartItem,
    removeCartItem,
    clearCart,
  ])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }

  return context
}
