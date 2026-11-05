import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Tags,
  ShoppingBag,
  Users,
  Star,
  TicketPercent,
  BarChart3,
  ArrowLeft,
  Store,
  X,
  LogOut,
} from 'lucide-react'

import { useAdminAuth } from '../../context/AdminAuthContext'

const navigation = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { name: 'Books', path: '/admin/books', icon: BookOpen },
      { name: 'Categories', path: '/admin/categories', icon: Tags },
      { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
      { name: 'Customers', path: '/admin/customers', icon: Users },
      { name: 'Reviews', path: '/admin/reviews', icon: Star },
      { name: 'Coupons', path: '/admin/coupons', icon: TicketPercent },
    ],
  },
]

export default function AdminSidebar({ isOpen, onClose }) {
  const { adminLogout } = useAdminAuth()
  const navigate = useNavigate()

  function handleLogout() {
    adminLogout()
    onClose?.()
    navigate('/admin/login', { replace: true })
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/10 bg-[#101010] transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <NavLink
            to="/admin"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C6A66B]">
              <Store size={18} className="text-[#0B0B0C]" />
            </div>

            <div>
              <h1 className="font-editorial text-xl text-[#F5F0E6]">
                SmartBook
              </h1>

              <p className="text-[9px] uppercase tracking-[0.25em] text-[#C6A66B]">
                Administration
              </p>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="text-[#A6A29A] transition hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-8 overflow-y-auto px-4 py-7">
          {navigation.map((section) => (
            <div key={section.title}>
              <p className="mb-3 px-3 text-[10px] font-medium tracking-[0.2em] text-[#77736C]">
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/admin'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                          isActive
                            ? 'bg-[#C6A66B]/10 text-[#C6A66B]'
                            : 'text-[#A6A29A] hover:bg-white/5 hover:text-[#F5F0E6]'
                        }`
                      }
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-white/10 p-4">
          {/* Back to Store */}
          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-[#A6A29A] transition hover:bg-white/5 hover:text-[#C6A66B]"
          >
            <ArrowLeft size={18} />
            Back to Store
          </NavLink>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-400 transition hover:bg-red-400/10 hover:text-red-300"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}