
import { createContext, useContext, useState } from 'react'

const AdminAuthContext = createContext(null)

const ADMIN_TOKEN_KEY = 'smartbook-admin-token'
const ADMIN_USER_KEY = 'smartbook-admin-user'

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem(ADMIN_TOKEN_KEY)
  )

  const [admin, setAdmin] = useState(() => {
    try {
      const savedUser = localStorage.getItem(ADMIN_USER_KEY)
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      localStorage.removeItem(ADMIN_USER_KEY)
      return null
    }
  })

  const isAdminAuthenticated = Boolean(token && admin?.role === 'admin')

  async function adminLogin(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        return {
          success: false,
          message: result.message || 'Admin login failed.',
        }
      }

      const { token: accessToken, user } = result.data || {}

      if (!accessToken || user?.role !== 'admin') {
        return {
          success: false,
          message: 'Access denied. Administrator account required.',
        }
      }

      localStorage.setItem(ADMIN_TOKEN_KEY, accessToken)
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user))

      setToken(accessToken)
      setAdmin(user)

      return { success: true }
    } catch (error) {
      console.error('Admin login error:', error)

      return {
        success: false,
        message: 'Unable to connect to the server. Please try again.',
      }
    }
  }

  function adminLogout() {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    localStorage.removeItem(ADMIN_USER_KEY)

    setToken(null)
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        admin,
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
      'useAdminAuth must be used inside AdminAuthProvider'
    )
  }

  return context
}
