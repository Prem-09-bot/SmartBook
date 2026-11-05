
import { useCallback, useEffect, useState } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  TicketPercent,
  IndianRupee,
  CalendarDays,
  CheckCircle,
  XCircle,
  Copy,
  Save,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
).replace(/\/$/, '')

const emptyForm = {
  code: '',
  type: 'Percentage',
  value: '',
  minOrder: '0',
  maxDiscount: '',
  usageLimit: '0',
  expiryDate: '',
  active: true,
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0)

const formatDate = (date) => {
  if (!date) return 'No expiry'

  const parsed = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsed.getTime())) return 'Invalid date'

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="border border-[#C6A66B]/20 bg-[#151515] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#A6A29A]">{title}</p>
          <h2 className="mt-2 text-2xl font-semibold">{value}</h2>
        </div>

        <div className={`bg-white/5 p-3 ${color}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

export default function AdminCoupons() {
  const { token, adminLogout } = useAdminAuth()

  const [coupons, setCoupons] = useState([])
  const [statistics, setStatistics] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    inactiveCoupons: 0,
    totalRedemptions: 0,
  })

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const fetchCoupons = useCallback(async (refresh = false) => {
    if (!token) {
      setLoading(false)
      setError('Admin token missing. Please sign in again.')
      return
    }

    if (refresh) setRefreshing(true)
    else setLoading(true)

    setError('')
    setNotice('')

    try {
      const params = new URLSearchParams()

      if (search.trim()) params.set('search', search.trim())

      params.set(
        'status',
        statusFilter === 'All' ? 'all' : statusFilter.toLowerCase()
      )

      const response = await fetch(
        `${API_BASE_URL}/api/admin/coupons?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const result = await response.json()

      if (response.status === 401 || response.status === 403) {
        adminLogout()
        throw new Error('Admin session expired. Please sign in again.')
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to load coupons.')
      }

      setCoupons(result.data.coupons || [])
      setStatistics(result.data.statistics || {})
    } catch (err) {
      setError(err.message || 'Unable to load coupons.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token, adminLogout, search, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => fetchCoupons(), 300)
    return () => clearTimeout(timer)
  }, [fetchCoupons])

  const openAddModal = () => {
    setEditingCoupon(null)
    setFormData(emptyForm)
    setError('')
    setModalOpen(true)
  }

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon)

    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrder: String(coupon.minOrder),
      maxDiscount: String(coupon.maxDiscount || ''),
      usageLimit: String(coupon.usageLimit || 0),
      expiryDate: coupon.expiryDate || '',
      active: coupon.active,
    })

    setError('')
    setModalOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (saving) return

    const couponData = {
      code: formData.code.trim().toUpperCase(),
      type: formData.type,
      value: Number(formData.value),
      minOrder: Number(formData.minOrder || 0),
      maxDiscount: Number(formData.maxDiscount || 0),
      usageLimit: Number(formData.usageLimit || 0),
      expiryDate: formData.expiryDate,
      active: formData.active,
    }

    if (!couponData.code || !couponData.value || !couponData.expiryDate) {
      setError('Please complete all required fields.')
      return
    }

    if (
      couponData.value <= 0 ||
      (couponData.type === 'Percentage' && couponData.value > 100)
    ) {
      setError('Enter a valid discount value.')
      return
    }

    if (
      couponData.minOrder < 0 ||
      couponData.maxDiscount < 0 ||
      couponData.usageLimit < 0
    ) {
      setError('Amounts and usage limits cannot be negative.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const isEditing = Boolean(editingCoupon)

      const response = await fetch(
        isEditing
          ? `${API_BASE_URL}/api/admin/coupons/${editingCoupon.id}`
          : `${API_BASE_URL}/api/admin/coupons`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(couponData),
        }
      )

      const result = await response.json()

      if (response.status === 401 || response.status === 403) {
        adminLogout()
        throw new Error('Admin session expired. Please sign in again.')
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to save coupon.')
      }

      setModalOpen(false)
      setEditingCoupon(null)
      setFormData(emptyForm)
      setNotice(result.message || 'Coupon saved successfully.')

      await fetchCoupons(true)
    } catch (err) {
      setError(err.message || 'Unable to save coupon.')
    } finally {
      setSaving(false)
    }
  }

  const toggleCoupon = async (coupon) => {
    const newActive = !coupon.active

    setError('')
    setNotice('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/coupons/${coupon.id}/status`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ active: newActive }),
        }
      )

      const result = await response.json()

      if (response.status === 401 || response.status === 403) {
        adminLogout()
        throw new Error('Admin session expired. Please sign in again.')
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to change coupon status.')
      }

      setNotice(result.message)
      await fetchCoupons(true)
    } catch (err) {
      setError(err.message || 'Unable to change coupon status.')
    }
  }

  const deleteCoupon = async (coupon) => {
    const confirmed = window.confirm(
      `Delete coupon "${coupon.code}" permanently?`
    )

    if (!confirmed) return

    setError('')
    setNotice('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/coupons/${coupon.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const result = await response.json()

      if (response.status === 401 || response.status === 403) {
        adminLogout()
        throw new Error('Admin session expired. Please sign in again.')
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to delete coupon.')
      }

      setNotice(result.message)
      await fetchCoupons(true)
    } catch (err) {
      setError(err.message || 'Unable to delete coupon.')
    }
  }

  const copyCoupon = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setNotice(`Coupon ${code} copied.`)
    } catch {
      setError(`Could not copy automatically. Coupon code: ${code}`)
    }
  }

  const updateForm = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] px-4 py-8 text-[#F5F0E6] sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#C6A66B]">
            Marketing Management
          </p>

          <h1 className="font-editorial text-3xl sm:text-4xl">
            Coupons
          </h1>

          <p className="mt-2 text-sm text-[#A6A29A]">
            Create and manage promotional offers and discount codes.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fetchCoupons(true)}
            disabled={loading || refreshing}
            className="flex items-center justify-center gap-2 border border-white/10 px-4 py-3 text-sm text-[#C6A66B] hover:border-[#C6A66B]/40 disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-[#C6A66B] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#D8BC83]"
          >
            <Plus size={18} />
            Create Coupon
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-5 flex items-center gap-2 border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {notice && (
        <div className="mb-5 border border-green-400/20 bg-green-400/5 p-4 text-sm text-green-300">
          {notice}
        </div>
      )}

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Coupons"
          value={statistics.totalCoupons}
          icon={TicketPercent}
          color="text-[#C6A66B]"
        />

        <StatCard
          title="Active Coupons"
          value={statistics.activeCoupons}
          icon={CheckCircle}
          color="text-green-400"
        />

        <StatCard
          title="Inactive Coupons"
          value={statistics.inactiveCoupons}
          icon={XCircle}
          color="text-red-400"
        />

        <StatCard
          title="Total Redemptions"
          value={Number(statistics.totalRedemptions || 0).toLocaleString('en-IN')}
          icon={IndianRupee}
          color="text-blue-400"
        />
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 border border-white/10 bg-[#151515] px-4 py-3 sm:w-80">
          <Search size={18} className="text-[#A6A29A]" />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search coupon code..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#777]"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="text-[#A6A29A] hover:text-white"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {['All', 'Active', 'Inactive'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`border px-4 py-2 text-xs transition ${
                statusFilter === status
                  ? 'border-[#C6A66B] bg-[#C6A66B] text-black'
                  : 'border-white/10 text-[#A6A29A] hover:border-[#C6A66B]/40'
              }`}
            >
              {status}
              {status !== 'All' && (
                <span className="ml-1.5">
                  ({status === 'Active'
                    ? statistics.activeCoupons
                    : statistics.inactiveCoupons})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Table */}
      <div className="overflow-hidden border border-white/10 bg-[#151515]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-editorial text-xl">All Coupons</h2>

          <span className="text-xs text-[#A6A29A]">
            {coupons.length} results
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-white/10 bg-[#0B0B0C]">
              <tr className="text-xs uppercase tracking-wider text-[#A6A29A]">
                <th className="px-5 py-4 font-medium">Coupon Code</th>
                <th className="px-5 py-4 font-medium">Discount</th>
                <th className="px-5 py-4 font-medium">Min. Order</th>
                <th className="px-5 py-4 font-medium">Usage</th>
                <th className="px-5 py-4 font-medium">Expiry Date</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-sm text-[#A6A29A]">
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tracking-wider text-[#C6A66B]">
                          {coupon.code}
                        </span>

                        <button
                          type="button"
                          onClick={() => copyCoupon(coupon.code)}
                          title="Copy coupon code"
                          className="text-[#777] transition hover:text-[#C6A66B]"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {coupon.type === 'Percentage'
                        ? `${coupon.value}% OFF`
                        : `${formatCurrency(coupon.value)} OFF`}
                    </td>

                    <td className="px-5 py-4 text-sm text-[#A6A29A]">
                      {formatCurrency(coupon.minOrder)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm">
                        {coupon.usedCount}/{coupon.usageLimit || '∞'}
                      </span>

                      {coupon.usageLimit > 0 && (
                        <div className="mt-2 h-1.5 w-24 overflow-hidden bg-white/10">
                          <div
                            className="h-full bg-[#C6A66B]"
                            style={{
                              width: `${Math.min(
                                (coupon.usedCount / coupon.usageLimit) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-[#A6A29A]">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} />
                        {formatDate(coupon.expiryDate)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`border px-2.5 py-1 text-xs ${
                          coupon.active
                            ? 'border-green-500/20 bg-green-500/10 text-green-400'
                            : 'border-red-500/20 bg-red-500/10 text-red-400'
                        }`}
                      >
                        {coupon.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => toggleCoupon(coupon)}
                          title={coupon.active ? 'Deactivate' : 'Activate'}
                          className={`p-2 transition ${
                            coupon.active
                              ? 'text-green-400 hover:bg-green-500/10'
                              : 'text-gray-400 hover:bg-white/5'
                          }`}
                        >
                          {coupon.active
                            ? <ToggleRight size={18} />
                            : <ToggleLeft size={18} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(coupon)}
                          title="Edit coupon"
                          className="p-2 text-[#A6A29A] transition hover:bg-[#C6A66B]/10 hover:text-[#C6A66B]"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteCoupon(coupon)}
                          title="Delete coupon"
                          className="p-2 text-[#A6A29A] transition hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-sm text-[#A6A29A]">
                    {search || statusFilter !== 'All'
                      ? 'No coupons match your search or filter.'
                      : 'No coupons found. Create your first coupon.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-xl border border-[#C6A66B]/20 bg-[#151515]">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#C6A66B]">
                  Coupon Management
                </p>

                <h2 className="mt-2 font-editorial text-2xl">
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-[#A6A29A] transition hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm text-[#A6A29A]">
                  Coupon Code *
                </label>

                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={50}
                  pattern="[A-Za-z0-9_-]+"
                  value={formData.code}
                  onChange={(event) =>
                    updateForm('code', event.target.value.toUpperCase())
                  }
                  placeholder="e.g. WELCOME20"
                  className="w-full border border-white/10 bg-[#0B0B0C] px-4 py-3 text-sm uppercase outline-none transition focus:border-[#C6A66B]/50"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-[#A6A29A]">
                    Discount Type *
                  </label>

                  <select
                    value={formData.type}
                    onChange={(event) => updateForm('type', event.target.value)}
                    className="w-full border border-white/10 bg-[#0B0B0C] px-4 py-3 text-sm outline-none focus:border-[#C6A66B]/50"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[#A6A29A]">
                    Discount Value *
                  </label>

                  <input
                    type="number"
                    required
                    min="0.01"
                    max={formData.type === 'Percentage' ? '100' : undefined}
                    step="0.01"
                    value={formData.value}
                    onChange={(event) => updateForm('value', event.target.value)}
                    placeholder={formData.type === 'Percentage' ? '20' : '100'}
                    className="w-full border border-white/10 bg-[#0B0B0C] px-4 py-3 text-sm outline-none focus:border-[#C6A66B]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-[#A6A29A]">
                    Minimum Order (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minOrder}
                    onChange={(event) => updateForm('minOrder', event.target.value)}
                    placeholder="499"
                    className="w-full border border-white/10 bg-[#0B0B0C] px-4 py-3 text-sm outline-none focus:border-[#C6A66B]/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[#A6A29A]">
                    Maximum Discount (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maxDiscount}
                    onChange={(event) => updateForm('maxDiscount', event.target.value)}
                    placeholder="200"
                    className="w-full border border-white/10 bg-[#0B0B0C] px-4 py-3 text-sm outline-none focus:border-[#C6A66B]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-[#A6A29A]">
                    Usage Limit
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.usageLimit}
                    onChange={(event) => updateForm('usageLimit', event.target.value)}
                    placeholder="500 (0 = unlimited)"
                    className="w-full border border-white/10 bg-[#0B0B0C] px-4 py-3 text-sm outline-none focus:border-[#C6A66B]/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[#A6A29A]">
                    Expiry Date *
                  </label>

                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(event) => updateForm('expiryDate', event.target.value)}
                    className="w-full border border-white/10 bg-[#0B0B0C] px-4 py-3 text-sm text-[#F5F0E6] outline-none focus:border-[#C6A66B]/50"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 text-sm text-[#A6A29A]">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(event) => updateForm('active', event.target.checked)}
                  className="h-4 w-4 accent-[#C6A66B]"
                />
                Activate coupon immediately
              </label>

              {error && (
                <p className="border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="flex-1 border border-white/10 px-4 py-3 text-sm text-[#A6A29A] transition hover:border-white/30"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 bg-[#C6A66B] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#D8BC83] disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving
                    ? 'Saving...'
                    : editingCoupon
                      ? 'Save Changes'
                      : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-[#777]">
        SmartBook Admin Panel · Live Database
      </p>
    </div>
  )
}
