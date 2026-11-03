import { createContext, useContext, useState } from 'react'

const AdminAuthContext = createContext(null)

const ADMIN_AUTH_KEY = 'smartbook-admin-auth'

export function AdminAuthProvider({ children }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    () => localStorage.getItem(ADMIN_AUTH_KEY) === 'true',
  )

  function adminLogin(email, password) {
    // Demo credentials (frontend only)
    if (
      email === 'admin@smartbook.com' &&
      password === 'Admin@123'
    ) {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true')
      setIsAdminAuthenticated(true)

      return { success: true }
    }

    return {
      success: false,
      message: 'Invalid admin email or password.',
    }
  }

  function adminLogout() {
    localStorage.removeItem(ADMIN_AUTH_KEY)
    setIsAdminAuthenticated(false)
  }

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)

  if (!context) {
    throw new Error(
      'useAdminAuth must be used inside AdminAuthProvider',
    )
  }

  return context
}