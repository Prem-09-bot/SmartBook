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

function readCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    return Array.isArray(savedCart) ? savedCart : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(readCart)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  // Keep the cart count synchronized across browser tabs.
  useEffect(() => {
    function handleStorage(event) {
      if (event.key === CART_KEY) {
        setCartItems(readCart())
      }
    }

    window.addEventListener('storage', handleStorage)

    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const refreshCart = useCallback(() => {
    setCartItems(readCart())
  }, [])

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + Math.max(0, Number(item.quantity) || 0),
        0,
      ),
    [cartItems],
  )

  const value = useMemo(
    () => ({
      cartItems,
      setCartItems,
      cartCount,
      refreshCart,
    }),
    [cartItems, cartCount, refreshCart],
  )

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