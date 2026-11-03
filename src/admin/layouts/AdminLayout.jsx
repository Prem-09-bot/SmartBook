import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'

import AdminSidebar from '../components/AdminSidebar'
import AdminHeader from '../components/AdminHeader'
import { useAdminAuth } from '../../context/AdminAuthContext'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { adminLogout } = useAdminAuth()
  const navigate = useNavigate()

  function handleLogout() {
    adminLogout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-luxury-ivory">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="min-h-screen lg:pl-64">
        {/* Header */}
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}