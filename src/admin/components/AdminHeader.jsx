import { useLocation } from 'react-router-dom'
import { Menu, Bell, Search } from 'lucide-react'

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/books': 'Books Management',
  '/admin/categories': 'Categories Management',
  '/admin/orders': 'Orders Management',
  '/admin/customers': 'Customers Management',
  '/admin/reviews': 'Reviews Management',
  '/admin/coupons': 'Coupons Management',
  '/admin/analytics': 'Analytics',
}

export default function AdminHeader({ onMenuClick }) {
  const location = useLocation()

  const title = pageTitles[location.pathname] || 'Admin Panel'

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#0B0B0C]/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-[#A6A29A] transition hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-lg font-medium text-[#F5F0E6] sm:text-xl">
            {title}
          </h2>

          <p className="hidden text-xs text-[#77736C] sm:block">
            Manage your SmartBook store
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Search */}
        <button
          className="rounded-lg p-2 text-[#A6A29A] transition hover:bg-white/5 hover:text-[#C6A66B]"
          aria-label="Search"
        >
          <Search size={19} />
        </button>

        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 text-[#A6A29A] transition hover:bg-white/5 hover:text-[#C6A66B]"
          aria-label="Notifications"
        >
          <Bell size={19} />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#C6A66B]" />
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 border-l border-white/10 pl-3 sm:pl-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C6A66B]/15 text-xs font-semibold text-[#C6A66B]">
            A
          </div>

          <div className="hidden sm:block">
            <p className="text-sm text-[#F5F0E6]">Admin</p>
            <p className="text-[10px] text-[#77736C]">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  )
}