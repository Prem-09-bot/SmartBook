
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const WishlistContext = createContext(null)

const WISHLIST_KEY = 'smartbook-wishlist'

function readWishlist() {
  try {
    const savedWishlist = JSON.parse(
      localStorage.getItem(WISHLIST_KEY) || '[]',
    )

    return Array.isArray(savedWishlist) ? savedWishlist : []
  } catch {
    return []
  }
}

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(readWishlist)

  // Persist wishlist changes.
  useEffect(() => {
    try {
      localStorage.setItem(
        WISHLIST_KEY,
        JSON.stringify(wishlistItems),
      )
    } catch (error) {
      console.error('Unable to save wishlist:', error)
    }
  }, [wishlistItems])

  // Synchronize wishlist changes across browser tabs.
  useEffect(() => {
    function handleStorage(event) {
      if (event.key === WISHLIST_KEY) {
        setWishlistItems(readWishlist())
      }
    }

    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  // Check whether a book is saved.
  const isInWishlist = useCallback(
    (bookId) =>
      wishlistItems.some((item) => item.id === bookId),
    [wishlistItems],
  )

  // Add a book or remove it if it is already saved.
  const toggleWishlist = useCallback((book) => {
    if (!book?.id) return

    setWishlistItems((currentItems) => {
      const alreadySaved = currentItems.some(
        (item) => item.id === book.id,
      )

      if (alreadySaved) {
        return currentItems.filter(
          (item) => item.id !== book.id,
        )
      }

      return [...currentItems, { id: book.id }]
    })
  }, [])

  // Remove a book explicitly.
  const removeFromWishlist = useCallback((bookId) => {
    setWishlistItems((currentItems) =>
      currentItems.filter((item) => item.id !== bookId),
    )
  }, [])

  // Reload the wishlist from localStorage when needed.
  const refreshWishlist = useCallback(() => {
    setWishlistItems(readWishlist())
  }, [])

  const wishlistCount = wishlistItems.length

  const value = useMemo(
    () => ({
      wishlistItems,
      wishlistCount,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
      setWishlistItems,
      refreshWishlist,
    }),
    [
      wishlistItems,
      wishlistCount,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
      refreshWishlist,
    ],
  )

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)

  if (!context) {
    throw new Error('useWishlist must be used inside WishlistProvider')
  }

  return context
}
