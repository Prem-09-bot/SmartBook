import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ''
).replace(/\/$/, '')

const USER_KEY = 'smartbook-user'
const TOKEN_KEY = 'smartbook-token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY)) || null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || ''
  )

  const isAuthenticated = Boolean(user && token)

  useEffect(() => {
    if (user && token) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(TOKEN_KEY)
    }
  }, [user, token])

  async function apiRequest(endpoint, body) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Something went wrong.')
    }

    return result.data
  }

  async function login(email, password) {
    const data = await apiRequest('/api/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    })

    if (!data.token || !data.user) {
      throw new Error('Invalid login response from server.')
    }

    if (data.user.role !== 'customer') {
      throw new Error('Please use the customer account to sign in here.')
    }

    setUser(data.user)
    setToken(data.token)

    return data.user
  }

  async function register(name, email, password) {
    await apiRequest('/api/auth/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    })

    // Registration endpoint does not return a JWT, so log in after registration.
    return await login(email, password)
  }

  function logout() {
    setUser(null)
    setToken('')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
