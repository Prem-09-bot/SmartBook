import { useState } from 'react'
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
} from 'lucide-react'

const initialCoupons = [
  {
    id: 1,
    code: 'WELCOME10',
    type: 'Percentage',
    value: 10,
    minOrder: 499,
    maxDiscount: 200,
    usageLimit: 500,
    usedCount: 124,
    expiryDate: '2026-12-31',
    active: true,
  },
  {
    id: 2,
    code: 'BOOKLOVE20',
    type: 'Percentage',
    value: 20,
    minOrder: 999,
    maxDiscount: 300,
    usageLimit: 200,
    usedCount: 86,
    expiryDate: '2026-11-30',
    active: true,
  },
  {
    id: 3,
    code: 'FLAT100',
    type: 'Fixed',
    value: 100,
    minOrder: 799,
    maxDiscount: 100,
    usageLimit: 1000,
    usedCount: 340,
    expiryDate: '2026-12-15',
    active: true,
  },
  {
    id: 4,
    code: 'FESTIVE15',
    type: 'Percentage',
    value: 15,
    minOrder: 599,
    maxDiscount: 250,
    usageLimit: 300,
    usedCount: 300,
    expiryDate: '2026-10-10',
    active: false,
  },
  {
    id: 5,
    code: 'NEWUSER50',
    type: 'Fixed',
    value: 50,
    minOrder: 299,
    maxDiscount: 50,
    usageLimit: 500,
    usedCount: 72,
    expiryDate: '2026-11-15',
    active: true,
  },
]

const emptyForm = {
  code: '',
  type: 'Percentage',
  value: '',
  minOrder: '',
  maxDiscount: '',
  usageLimit: '',
  expiryDate: '',
  active: true,
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState(initialCoupons)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && coupon.active) ||
      (statusFilter === 'Inactive' && !coupon.active)

    return matchesSearch && matchesStatus
  })

  const activeCoupons = coupons.filter((coupon) => coupon.active).length

  const totalUsage = coupons.reduce(
    (sum, coupon) => sum + coupon.usedCount,
    0
  )

  const openAddModal = () => {
    setEditingCoupon(null)
    setFormData(emptyForm)
    setModalOpen(true)
  }

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrder: String(coupon.minOrder),
      maxDiscount: String(coupon.maxDiscount),
      usageLimit: String(coupon.usageLimit),
      expiryDate: coupon.expiryDate,
      active: coupon.active,
    })
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const normalizedCode = formData.code.trim().toUpperCase()

    if (!normalizedCode || Number(formData.value) <= 0) {
      alert('Please enter a valid coupon code and discount value.')
      return
    }

    const duplicate = coupons.some(
      (coupon) =>
        coupon.code === normalizedCode &&
        coupon.id !== editingCoupon?.id
    )

    if (duplicate) {
      alert('This coupon code already exists.')
      return
    }

    const couponData = {
      code: normalizedCode,
      type: formData.type,
      value: Number(formData.value),
      minOrder: Number(formData.minOrder) || 0,
      maxDiscount: Number(formData.maxDiscount) || 0,
      usageLimit: Number(formData.usageLimit) || 0,
      expiryDate: formData.expiryDate,
      active: formData.active,
    }

    if (editingCoupon) {
      setCoupons((prev) =>
        prev.map((coupon) =>
          coupon.id === editingCoupon.id
            ? { ...coupon, ...couponData }
            : coupon
        )
      )
    } else {
      setCoupons((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...couponData,
          usedCount: 0,
        },
      ])
    }

    setModalOpen(false)
  }

  const deleteCoupon = (id) => {
    const coupon = coupons.find((item) => item.id === id)

    if (
      window.confirm(
        `Are you sure you want to delete coupon "${coupon?.code}"?`
      )
    ) {
      setCoupons((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const toggleCoupon = (id) => {
    setCoupons((prev) =>
      prev.map((coupon) =>
        coupon.id === id
          ? { ...coupon, active: !coupon.active }
          : coupon
      )
    )
  }

  const copyCoupon = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      alert(`Coupon "${code}" copied!`)
    } catch {
      alert(`Coupon code: ${code}`)
    }
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

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-[#C6A66B] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#D8BC83]"
        >
          <Plus size={18} />
          Create Coupon
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Coupons"
          value={coupons.length}
          icon={TicketPercent}
          color="text-[#C6A66B]"
        />

        <StatCard
          title="Active Coupons"
          value={activeCoupons}
          icon={CheckCircle}
          color="text-green-400"
        />

        <StatCard
          title="Inactive Coupons"
          value={coupons.length - activeCoupons}
          icon={XCircle}
          color="text-red-400"
        />

        <StatCard
          title="Total Redemptions"
          value={totalUsage.toLocaleString('en-IN')}
          icon={IndianRupee}
          color="text-blue-400"
        />
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 border border-white/10 bg-[#151515] px-4 py-3 sm:w-80">
          <Search size={18} className="text-[#A6A29A]" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupon code..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#777]"
          />
        </div>

        <div className="flex gap-2">
          {['All', 'Active', 'Inactive'].map((status) => (
            <button
              key={status}
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
                (
                {
                  coupons.filter((coupon) =>
                    status === 'Active'
                      ? coupon.active
                      : !coupon.active
                  ).length
                }
                )
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
            {filteredCoupons.length} results
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
              {filteredCoupons.map((coupon) => (
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
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {coupon.usedCount}/{coupon.usageLimit || '∞'}
                      </span>
                    </div>

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
                      {new Date(coupon.expiryDate).toLocaleDateString(
                        'en-IN',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }
                      )}
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
                        onClick={() => toggleCoupon(coupon.id)}
                        title={coupon.active ? 'Deactivate' : 'Activate'}
                        className={`p-2 transition ${
                          coupon.active
                            ? 'text-green-400 hover:bg-green-500/10'
                            : 'text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        {coupon.active ? (
                          <ToggleRight size={18} />
                        ) : (
                          <ToggleLeft size={18} />
                        )}
                      </button>

                      <button
                        onClick={() => openEditModal(coupon)}
                        title="Edit coupon"
                        className="p-2 text-[#A6A29A] transition hover:bg-[#C6A66B]/10 hover:text-[#C6A66B]"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => deleteCoupon(coupon.id)}
                        title="Delete coupon"
                        className="p-2 text-[#A6A29A] transition hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCoupons.length === 0 && (
            <div className="py-16 text-center text-sm text-[#A6A29A]">
              No coupons found.
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Coupon Modal */}
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
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
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
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
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
                    min="1"
                    max={formData.type === 'Percentage' ? '100' : undefined}
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
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
                    value={formData.minOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrder: e.target.value })
                    }
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
                    value={formData.maxDiscount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxDiscount: e.target.value,
                      })
                    }
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
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usageLimit: e.target.value,
                      })
                    }
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expiryDate: e.target.value,
                      })
                    }
                    className="w-full border border-white/10 bg-[#0B0B0C] px-4 py-3 text-sm text-[#F5F0E6] outline-none focus:border-[#C6A66B]/50"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 text-sm text-[#A6A29A]">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="h-4 w-4 accent-[#C6A66B]"
                />
                Activate coupon immediately
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 border border-white/10 px-4 py-3 text-sm text-[#A6A29A] transition hover:border-white/30"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 bg-[#C6A66B] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#D8BC83]"
                >
                  <Save size={16} />
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Demo Notice */}
      <p className="mt-8 text-center text-xs text-[#777]">
        Demo mode — coupon changes are stored locally and reset on refresh.
      </p>
    </div>
  )
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
