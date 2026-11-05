import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  BookOpen,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-react'

import { useCart } from '../../context/CartContext'

const navigation = [
  { name: 'Home', path: '/' },
  { name: 'Discover Books', path: '/books' },
  { name: 'Categories', path: '/categories' },
  { name: 'AI Concierge', path: '/ai-concierge' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { cartCount } = useCart()

  const linkClasses = ({ isActive }) =>
    `text-sm transition-colors duration-200 ${
      isActive
        ? 'text-luxury-gold'
        : 'text-luxury-muted hover:text-luxury-ivory'
    }`

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-luxury-black/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center border border-luxury-gold/50 text-luxury-gold">
            <BookOpen size={21} strokeWidth={1.5} />
          </div>

          <div>
            <span className="block font-editorial text-2xl tracking-wide text-luxury-ivory">
              SmartBook
            </span>

            <span className="block text-[9px] uppercase tracking-[0.28em] text-luxury-muted">
              Stories worth keeping
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 lg:flex"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={linkClasses}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-5 md:flex">
          {/* Search */}
          <Link
            to="/books"
            aria-label="Search books"
            title="Discover books"
            className="text-luxury-muted transition hover:text-luxury-gold"
          >
            <Search size={20} strokeWidth={1.6} />
          </Link>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            title="My wishlist"
            className="text-luxury-muted transition hover:text-luxury-gold"
          >
            <Heart size={20} strokeWidth={1.6} />
          </Link>

         {/* Login */}


{/* Account */}
<Link
  to="/account"
  aria-label="Account"
  title="My account"
  className="text-luxury-muted transition hover:text-luxury-gold"
>
  <UserRound size={20} strokeWidth={1.6} />
</Link>
          {/* Shopping Cart with Live Count */}
          <Link
            to="/cart"
            aria-label={`Shopping cart with ${cartCount} ${
              cartCount === 1 ? 'item' : 'items'
            }`}
            title="Shopping cart"
            className="relative flex items-center justify-center text-luxury-muted transition hover:text-luxury-gold"
          >
            <ShoppingCart size={21} strokeWidth={1.6} />

            {cartCount > 0 && (
              <span className="absolute -right-2.5 -top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-luxury-gold px-1 text-[10px] font-bold text-luxury-black">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* Explore Books */}
          <Link
            to="/books"
            className="bg-luxury-gold px-5 py-3 text-xs font-semibold uppercase tracking-wider text-luxury-black transition hover:bg-luxury-ivory"
          >
            Explore Books
          </Link>

          <Link
  to="/login"
  className="text-sm text-luxury-muted transition hover:text-luxury-gold"
>
  Sign In
</Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-4 md:hidden">
          {/* Mobile Cart */}
          <Link
            to="/cart"
            aria-label={`Shopping cart with ${cartCount} ${
              cartCount === 1 ? 'item' : 'items'
            }`}
            className="relative flex items-center justify-center text-luxury-ivory transition hover:text-luxury-gold"
          >
            <ShoppingCart size={21} strokeWidth={1.6} />

            {cartCount > 0 && (
              <span className="absolute -right-2.5 -top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-luxury-gold px-1 text-[10px] font-bold text-luxury-black">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((current) => !current)}
            className="text-luxury-ivory transition hover:text-luxury-gold"
          >
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-white/10 bg-luxury-black px-6 py-5 md:hidden"
        >
          <div className="flex flex-col">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `border-b border-white/5 py-4 text-sm transition-colors ${
                    isActive
                      ? 'text-luxury-gold'
                      : 'text-luxury-muted hover:text-luxury-ivory'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}

            {/* Mobile Wishlist */}
            <Link
              to="/wishlist"
              onClick={closeMenu}
              className="flex items-center gap-3 border-b border-white/5 py-4 text-sm text-luxury-muted transition hover:text-luxury-gold"
            >
              <Heart size={17} />
              My Wishlist
            </Link>

           {/* Mobile Login */}
<Link
  to="/login"
  onClick={closeMenu}
  className="flex items-center gap-3 border-b border-white/5 py-4 text-sm text-luxury-muted transition hover:text-luxury-gold"
>
  <UserRound size={17} />
  Sign In / Register
</Link>

{/* Mobile Account */}
<Link
  to="/account"
  onClick={closeMenu}
  className="flex items-center gap-3 border-b border-white/5 py-4 text-sm text-luxury-muted transition hover:text-luxury-gold"
>
  <UserRound size={17} />
  My Account
</Link>

            {/* Mobile Explore Button */}
            <Link
              to="/books"
              onClick={closeMenu}
              className="mt-5 flex items-center justify-center gap-2 bg-luxury-gold px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-luxury-black transition hover:bg-luxury-ivory"
            >
              <BookOpen size={16} />
              Explore Books
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}