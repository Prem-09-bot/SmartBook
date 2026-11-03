import { useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'

import {
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react'

import { useAdminAuth } from '../../context/AdminAuthContext'

export default function AdminLogin() {
  const { adminLogin, isAdminAuthenticated } = useAdminAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect authenticated admins to the dashboard.
  if (isAdminAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  // Handle admin login.
  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = adminLogin(email.trim(), password)

      if (result.success) {
        navigate('/admin', { replace: true })
      } else {
        setError(result.message || 'Invalid admin email or password.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    'w-full border border-white/15 bg-luxury-black px-4 py-3.5 text-sm text-luxury-ivory outline-none transition placeholder:text-luxury-muted/50 focus:border-luxury-gold'

  return (
    <main className="flex min-h-screen items-center justify-center bg-luxury-black px-4 py-12 text-luxury-ivory">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-luxury-gold transition hover:text-luxury-ivory"
          >
            <BookOpen size={25} strokeWidth={1.5} />

            <span className="font-editorial text-2xl">
              SmartBook
            </span>
          </Link>

          <div className="mx-auto mt-8 flex h-14 w-14 items-center justify-center border border-luxury-gold/30 bg-luxury-gold/5 text-luxury-gold">
            <ShieldCheck size={26} strokeWidth={1.5} />
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.25em] text-luxury-gold">
            Restricted Access
          </p>

          <h1 className="mt-3 font-editorial text-3xl sm:text-4xl">
            Admin Portal
          </h1>

          <p className="mt-3 text-sm text-luxury-muted">
            Sign in to manage your SmartBook store.
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="border border-white/10 bg-luxury-surface p-6 sm:p-8"
        >
          {/* Email */}
          <div>
            <label
              htmlFor="adminEmail"
              className="mb-2 block text-sm text-luxury-ivory"
            >
              Admin Email
            </label>

            <input
              id="adminEmail"
              name="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setError('')
              }}
              placeholder="admin@smartbook.com"
              autoComplete="username"
              required
              className={inputClass}
            />
          </div>

          {/* Password */}
          <div className="mt-5">
            <label
              htmlFor="adminPassword"
              className="mb-2 block text-sm text-luxury-ivory"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="adminPassword"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError('')
                }}
                placeholder="Enter your admin password"
                autoComplete="current-password"
                required
                className={`${inputClass} pr-12`}
              />

              {/* Toggle Password Visibility */}
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-muted transition hover:text-luxury-gold"
                aria-label={
                  showPassword ? 'Hide password' : 'Show password'
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p
              role="alert"
              className="mt-5 border border-red-400/30 bg-red-400/5 p-3 text-xs leading-5 text-red-300"
            >
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 flex w-full items-center justify-center gap-2 bg-luxury-gold px-5 py-4 text-sm font-semibold text-luxury-black transition hover:bg-luxury-ivory disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In to Admin'}

            {!isSubmitting && <ArrowRight size={17} />}
          </button>

          {/* Demo Notice */}
          <p className="mt-5 text-center text-[11px] leading-5 text-luxury-muted">
            Demo login only. Backend authentication will be integrated later.
          </p>
        </form>

        {/* Back to Store */}
        <Link
          to="/"
          className="mt-6 block text-center text-xs text-luxury-muted transition hover:text-luxury-gold"
        >
          ← Back to SmartBook Store
        </Link>

      </div>
    </main>
  )
}
