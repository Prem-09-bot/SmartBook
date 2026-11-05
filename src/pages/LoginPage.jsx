import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

const initialLoginForm = {
  email: '',
  password: '',
}

const initialRegisterForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  placeholder = 'Enter your password',
  error,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm text-luxury-ivory"
      >
        {label}
      </label>

      <div
        className={`flex items-center border bg-luxury-black transition focus-within:border-luxury-gold ${
          error ? 'border-red-400/60' : 'border-white/15'
        }`}
      >
        <LockKeyhole
          size={17}
          className="ml-4 shrink-0 text-luxury-muted"
        />

       <input
  id={id}
  name={
    id === 'login-password'
      ? 'password'
      : id === 'register-confirm-password'
        ? 'confirmPassword'
        : 'password'
  }
  type={visible ? 'text' : 'password'}
  value={value}
  onChange={onChange}
  placeholder={placeholder}
          autoComplete={
            id === 'login-password'
              ? 'current-password'
              : id === 'register-confirm-password'
                ? 'new-password'
                : 'new-password'
          }
          className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-luxury-ivory outline-none placeholder:text-luxury-muted/50"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="px-4 text-luxury-muted transition hover:text-luxury-gold"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
const location = useLocation()

const redirectTo = location.state?.from?.pathname || '/account'
  const { login, register } = useAuth()

  const [mode, setMode] = useState('login')
  const [loginForm, setLoginForm] = useState(initialLoginForm)
  const [registerForm, setRegisterForm] = useState(initialRegisterForm)

  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const isLogin = mode === 'login'

  function switchMode(nextMode) {
    setMode(nextMode)
    setErrors({})
    setNotice('')
  }

  function updateLoginField(event) {
    const { name, value } = event.target

    setLoginForm((current) => ({
      ...current,
      [name]: value,
    }))

    setErrors((current) => ({
      ...current,
      [name]: '',
      form: '',
    }))
  }

  function updateRegisterField(event) {
    const { name, value } = event.target

    setRegisterForm((current) => ({
      ...current,
      [name]: value,
    }))

    setErrors((current) => ({
      ...current,
      [name]: '',
      form: '',
    }))
  }

  function validateLogin() {
    const nextErrors = {}

    if (!loginForm.email.trim()) {
      nextErrors.email = 'Email address is required.'
    } else if (!validateEmail(loginForm.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!loginForm.password) {
      nextErrors.password = 'Password is required.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function validateRegistration() {
    const nextErrors = {}

    if (!registerForm.name.trim()) {
      nextErrors.name = 'Full name is required.'
    } else if (registerForm.name.trim().length < 2) {
      nextErrors.name = 'Name must contain at least 2 characters.'
    }

    if (!registerForm.email.trim()) {
      nextErrors.email = 'Email address is required.'
    } else if (!validateEmail(registerForm.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!registerForm.password) {
      nextErrors.password = 'Password is required.'
    } else if (registerForm.password.length < 8) {
      nextErrors.password = 'Use at least 8 characters.'
    }

    if (!registerForm.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.'
    } else if (
      registerForm.password !== registerForm.confirmPassword
    ) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

 async function handleLogin(event) {
  event.preventDefault()
  setNotice('')
  if (!validateLogin()) return
  setLoading(true)
  try {
    await login(loginForm.email, loginForm.password)
    navigate(redirectTo, { replace: true })
  } catch (error) {
    setErrors({ form: error.message || 'Unable to sign in. Please try again.' })
  } finally {
    setLoading(false)
  }
}

async function handleRegister(event) {
  event.preventDefault()
  setNotice('')
  if (!validateRegistration()) return
  setLoading(true)
  try {
    await register(registerForm.name, registerForm.email, registerForm.password)
    navigate(redirectTo, { replace: true })
  } catch (error) {
    setErrors({ form: error.message || 'Unable to create your account. Please try again.' })
  } finally {
    setLoading(false)
  }
}

  return (
    <main className="min-h-screen bg-luxury-black text-luxury-ivory">
      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-[1440px] lg:grid-cols-2">
        {/* Left: Brand Panel */}
        <section className="relative hidden overflow-hidden border-r border-white/10 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-luxury-gold/5 blur-3xl" />

          <Link
            to="/"
            className="relative inline-flex w-fit items-center gap-3"
          >
            <span className="flex h-12 w-12 items-center justify-center border border-luxury-gold/40">
              <BookOpen
                size={24}
                className="text-luxury-gold"
                strokeWidth={1.4}
              />
            </span>

            <span className="font-editorial text-2xl tracking-wide">
              SmartBook
            </span>
          </Link>

          <div className="relative max-w-xl py-12">
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-luxury-gold">
              A World Between Pages
            </p>

            <h1 className="font-editorial text-5xl leading-tight xl:text-7xl">
              Your next
              <span className="block italic text-luxury-gold">
                great read
              </span>
              begins here.
            </h1>

            <p className="mt-7 max-w-md text-sm leading-7 text-luxury-muted xl:text-base">
              Discover stories, explore new perspectives, and build
              a reading collection that feels uniquely yours.
            </p>

            <div className="mt-10 flex items-center gap-4 border-t border-white/10 pt-6">
              <div className="flex h-11 w-11 items-center justify-center border border-luxury-gold/25 text-luxury-gold">
                <ShieldCheck size={21} />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Your reading journey
                </p>

                <p className="mt-1 text-xs text-luxury-muted">
                  A personal space for every reader.
                </p>
              </div>
            </div>
          </div>

          <p className="relative text-xs text-luxury-muted">
            Read more. Discover more. Be more.
          </p>
        </section>

        {/* Right: Authentication Form */}
        <section className="flex items-center justify-center px-4 py-12 sm:px-8 sm:py-16 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <Link
              to="/"
              className="mb-10 inline-flex items-center gap-3 lg:hidden"
            >
              <span className="flex h-10 w-10 items-center justify-center border border-luxury-gold/40">
                <BookOpen
                  size={21}
                  className="text-luxury-gold"
                />
              </span>

              <span className="font-editorial text-xl">
                SmartBook
              </span>
            </Link>

            <div className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-luxury-gold">
                {isLogin ? 'Welcome Back' : 'Join SmartBook'}
              </p>

              <h2 className="font-editorial text-4xl sm:text-5xl">
                {isLogin ? 'Sign in.' : 'Create account.'}
              </h2>

              <p className="mt-4 text-sm leading-6 text-luxury-muted">
                {isLogin
                  ? 'Continue your reading journey where you left off.'
                  : 'Create your account and start building your personal library.'}
              </p>
            </div>

            {/* Mode Switch */}
            <div className="mb-8 grid grid-cols-2 border border-white/10 p-1">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`px-4 py-3 text-sm transition ${
                  isLogin
                    ? 'bg-luxury-gold font-semibold text-luxury-black'
                    : 'text-luxury-muted hover:text-luxury-ivory'
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`px-4 py-3 text-sm transition ${
                  !isLogin
                    ? 'bg-luxury-gold font-semibold text-luxury-black'
                    : 'text-luxury-muted hover:text-luxury-ivory'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={isLogin ? handleLogin : handleRegister}
              noValidate
              className="space-y-5"
            >
              {!isLogin && (
                <div>
                  <label
                    htmlFor="register-name"
                    className="mb-2 block text-sm"
                  >
                    Full Name
                  </label>

                  <div
                    className={`flex items-center border bg-luxury-black transition focus-within:border-luxury-gold ${
                      errors.name
                        ? 'border-red-400/60'
                        : 'border-white/15'
                    }`}
                  >
                    <UserRound
                      size={17}
                      className="ml-4 shrink-0 text-luxury-muted"
                    />

                    <input
                      id="register-name"
                      name="name"
                      type="text"
                      value={registerForm.name}
                      onChange={updateRegisterField}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className="w-full bg-transparent px-3 py-3.5 text-sm outline-none placeholder:text-luxury-muted/50"
                    />
                  </div>

                  {errors.name && (
                    <p className="mt-2 text-xs text-red-400">
                      {errors.name}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor={isLogin ? 'login-email' : 'register-email'}
                  className="mb-2 block text-sm"
                >
                  Email Address
                </label>

                <div
                  className={`flex items-center border bg-luxury-black transition focus-within:border-luxury-gold ${
                    errors.email
                      ? 'border-red-400/60'
                      : 'border-white/15'
                  }`}
                >
                  <Mail
                    size={17}
                    className="ml-4 shrink-0 text-luxury-muted"
                  />

                  <input
                    id={isLogin ? 'login-email' : 'register-email'}
                    name="email"
                    type="email"
                    value={
                      isLogin ? loginForm.email : registerForm.email
                    }
                    onChange={
                      isLogin ? updateLoginField : updateRegisterField
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full bg-transparent px-3 py-3.5 text-sm outline-none placeholder:text-luxury-muted/50"
                  />
                </div>

                {errors.email && (
                  <p className="mt-2 text-xs text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              <PasswordField
                id={isLogin ? 'login-password' : 'register-password'}
                label="Password"
                value={
                  isLogin ? loginForm.password : registerForm.password
                }
                onChange={
                  isLogin ? updateLoginField : updateRegisterField
                }
                visible={
                  isLogin
                    ? showLoginPassword
                    : showRegisterPassword
                }
                onToggle={() =>
                  isLogin
                    ? setShowLoginPassword((current) => !current)
                    : setShowRegisterPassword((current) => !current)
                }
                error={errors.password}
              />

              {isLogin ? (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setNotice(
                        'Password recovery will be available when the backend API is connected.',
                      )
                    }
                    className="text-xs text-luxury-gold transition hover:text-luxury-ivory"
                  >
                    Forgot password?
                  </button>
                </div>
              ) : (
                <PasswordField
                  id="register-confirm-password"
                  label="Confirm Password"
                  value={registerForm.confirmPassword}
                  onChange={updateRegisterField}
                  visible={showConfirmPassword}
                  onToggle={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  placeholder="Re-enter your password"
                  error={errors.confirmPassword}
                />
              )}

              {errors.form && (
                <p role="alert" className="text-sm text-red-400">
                  {errors.form}
                </p>
              )}

              {notice && (
                <div
                  role="status"
                  className="border border-luxury-gold/25 bg-luxury-surface p-4 text-sm leading-6 text-luxury-gold"
                >
                  {notice}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 bg-luxury-gold px-6 py-4 text-sm font-semibold text-luxury-black transition hover:bg-luxury-ivory disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? 'Please wait...'
                  : isLogin
                    ? 'Sign In'
                    : 'Create Account'}

                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />

              <span className="text-xs text-luxury-muted">
                YOUR READING JOURNEY
              </span>

              <div className="h-px flex-1 bg-white/10" />
            </div>

            <p className="text-center text-sm leading-6 text-luxury-muted">
              {isLogin
                ? "Don't have an account yet? "
                : 'Already have an account? '}

              <button
                type="button"
                onClick={() =>
                  switchMode(isLogin ? 'register' : 'login')
                }
                className="font-medium text-luxury-gold transition hover:text-luxury-ivory"
              >
                {isLogin ? 'Create one' : 'Sign in'}
              </button>
            </p>

            <p className="mt-8 text-center text-xs text-luxury-muted">
              By continuing, you agree to our{' '}
              <Link
                to="/terms"
                className="text-luxury-gold hover:underline"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="text-luxury-gold hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="mx-auto mt-6 block text-xs text-luxury-muted transition hover:text-luxury-gold"
            >
              ← Back to Home
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}