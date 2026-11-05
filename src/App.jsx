import { Routes, Route } from 'react-router-dom'

// Store Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Store Pages
import HomePage from './pages/HomePage'
import DiscoverBooks from './pages/DiscoverBooks'
import BookDetails from './pages/BookDetails'
import CartPage from './pages/CartPage'
import WishlistPage from './pages/WishlistPage'
import AIConcierge from './pages/AIConcierge'
import CategoriesPage from './pages/CategoriesPage'
import LoginPage from './pages/LoginPage'
import AccountPage from './pages/AccountPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderDetailsPage from './pages/OrderDetailsPage'

// Customer Authentication
import ProtectedRoute from './components/auth/ProtectedRoute'

// Admin Components
import AdminLayout from './admin/layouts/AdminLayout'
import AdminDashboard from './admin/pages/AdminDashboard'
import AdminBooks from './admin/pages/AdminBooks'
import AdminCategories from './admin/pages/AdminCategories'
import AdminOrders from './admin/pages/AdminOrders'
import AdminCustomers from './admin/pages/AdminCustomers'
import AdminReviews from './admin/pages/AdminReviews'
import AdminCoupons from './admin/pages/AdminCoupons'
import AdminAnalytics from './admin/pages/AdminAnalytics'

// Admin Authentication
import { AdminAuthProvider } from './context/AdminAuthContext'
import ProtectedAdminRoute from './admin/components/ProtectedAdminRoute'
import AdminLogin from './admin/pages/AdminLogin'

// Placeholder Page
function PlaceholderPage({ title, description }) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-5 py-20">
      <div className="max-w-xl text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-luxury-gold">
          SmartBook
        </p>

        <h1 className="mt-5 font-editorial text-4xl text-luxury-ivory sm:text-5xl">
          {title}
        </h1>

        <p className="mt-5 text-sm leading-7 text-luxury-muted">
          {description}
        </p>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-luxury-black">
        <Routes>
          {/* ========================= */}
          {/* CUSTOMER STORE ROUTES    */}
          {/* ========================= */}

          <Route
            path="/"
            element={
              <>
                <Navbar />
                <HomePage />
                <Footer />
              </>
            }
          />

          <Route
            path="/books"
            element={
              <>
                <Navbar />
                <DiscoverBooks />
                <Footer />
              </>
            }
          />

          <Route
            path="/books/:id"
            element={
              <>
                <Navbar />
                <BookDetails />
                <Footer />
              </>
            }
          />

          <Route
            path="/cart"
            element={
              <>
                <Navbar />
                <CartPage />
                <Footer />
              </>
            }
          />

          <Route
            path="/wishlist"
            element={
              <>
                <Navbar />
                <WishlistPage />
                <Footer />
              </>
            }
          />

          <Route
            path="/ai-concierge"
            element={
              <>
                <Navbar />
                <AIConcierge />
                <Footer />
              </>
            }
          />

          <Route
            path="/categories"
            element={
              <>
                <Navbar />
                <CategoriesPage />
                <Footer />
              </>
            }
          />

          <Route
            path="/login"
            element={
              <>
                <Navbar />
                <LoginPage />
                <Footer />
              </>
            }
          />

          {/* Protected Customer Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/account"
              element={
                <>
                  <Navbar />
                  <AccountPage />
                  <Footer />
                </>
              }
            />

            <Route
              path="/checkout"
              element={
                <>
                  <Navbar />
                  <CheckoutPage />
                  <Footer />
                </>
              }
            />
          </Route>

          <Route
            path="/orders/:orderId"
            element={
              <>
                <Navbar />
                <OrderDetailsPage />
                <Footer />
              </>
            }
          />

          {/* ========================= */}
          {/* ADMIN PANEL ROUTES       */}
          {/* ========================= */}

          {/* Admin Login - Public */}
          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedAdminRoute />}>
            <Route
              path="/admin"
              element={<AdminLayout />}
            >
              <Route index element={<AdminDashboard />} />

              <Route path="books" element={<AdminBooks />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>
          </Route>

          {/* ========================= */}
          {/* LEGAL ROUTES             */}
          {/* ========================= */}

          <Route
            path="/privacy"
            element={
              <>
                <Navbar />
                <PlaceholderPage
                  title="Privacy Policy"
                  description="Our privacy policy will be published before launch."
                />
                <Footer />
              </>
            }
          />

          <Route
            path="/terms"
            element={
              <>
                <Navbar />
                <PlaceholderPage
                  title="Terms of Service"
                  description="Our terms of service will be published before launch."
                />
                <Footer />
              </>
            }
          />

          {/* ========================= */}
          {/* 404 ROUTE                */}
          {/* ========================= */}

          <Route
            path="*"
            element={
              <>
                <Navbar />
                <PlaceholderPage
                  title="Page Not Found"
                  description="The page you're looking for doesn't exist."
                />
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </AdminAuthProvider>
  )
}