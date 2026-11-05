import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

export default function ProtectedAdminRoute() {
  const { isAdminAuthenticated } = useAdminAuth()

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
