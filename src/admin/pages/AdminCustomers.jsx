import { useState } from 'react'
import {
  Search,
  Eye,
  X,
  Users,
  ShoppingBag,
  IndianRupee,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
} from 'lucide-react'

const initialCustomers = [
  {
    id: 'CUS-001',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '+91 9876543210',
    joined: '2026-08-12',
    location: 'Kolkata, West Bengal',
    status: 'Active',
    orders: 5,
    spent: 2495,
  },
  {
    id: 'CUS-002',
    name: 'Priya Das',
    email: 'priya@example.com',
    phone: '+91 9876543211',
    joined: '2026-08-19',
    location: 'Howrah, West Bengal',
    status: 'Active',
    orders: 3,
    spent: 1647,
  },
  {
    id: 'CUS-003',
    name: 'Amit Roy',
    email: 'amit@example.com',
    phone: '+91 9876543212',
    joined: '2026-09-02',
    location: 'Durgapur, West Bengal',
    status: 'Active',
    orders: 2,
    spent: 898,
  },
  {
    id: 'CUS-004',
    name: 'Sneha Gupta',
    email: 'sneha@example.com',
    phone: '+91 9876543213',
    joined: '2026-09-10',
    location: 'Siliguri, West Bengal',
    status: 'Blocked',
    orders: 1,
    spent: 498,
  },
  {
    id: 'CUS-005',
    name: 'Arjun Sen',
    email: 'arjun@example.com',
    phone: '+91 9876543214',
    joined: '2026-09-18',
    location: 'Asansol, West Bengal',
    status: 'Active',
    orders: 4,
    spent: 2197,
  },
  {
    id: 'CUS-006',
    name: 'Meera Banerjee',
    email: 'meera@example.com',
    phone: '+91 9876543215',
    joined: '2026-10-01',
    location: 'Kolkata, West Bengal',
    status: 'Active',
    orders: 6,
    spent: 3294,
  },
]

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

export default function AdminCustomers() {
  const [customers, setCustomers] = useState(initialCustomers)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase()) ||
      customer.id.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || customer.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const activeCustomers = customers.filter(
    (customer) => customer.status === 'Active'
  ).length

  const blockedCustomers = customers.filter(
    (customer) => customer.status === 'Blocked'
  ).length

  const totalOrders = customers.reduce(
    (sum, customer) => sum + customer.orders,
    0
  )

  const totalRevenue = customers.reduce(
    (sum, customer) => sum + customer.spent,
    0
  )

  const toggleCustomerStatus = (customerId) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
                status:
                  customer.status === 'Active' ? 'Blocked' : 'Active',
            }
          : customer
      )
    )

    setSelectedCustomer((prev) =>
      prev && prev.id === customerId
        ? {
            ...prev,
            status: prev.status === 'Active' ? 'Blocked' : 'Active',
          }
        : prev
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] px-4 py-8 text-[#F5F0E6] sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#C6A66B]">
          User Management
        </p>

        <h1 className="font-editorial text-3xl sm:text-4xl">
          Customers
        </h1>

        <p className="mt-2 text-sm text-[#A6A29A]">
          Manage customer profiles and monitor their activity.
        </p>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Customers"
          value={customers.length}
          icon={Users}
          color="text-[#C6A66B]"
        />

        <StatCard
          title="Active Customers"
          value={activeCustomers}
          icon={UserCheck}
          color="text-green-400"
        />

        <StatCard
          title="Blocked Customers"
          value={blockedCustomers}
          icon={UserX}
          color="text-red-400"
        />

        <StatCard
          title="Total Customer Spending"
          value={formatCurrency(totalRevenue)}
          icon={IndianRupee}
          color="text-blue-400"
        />

      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-3 border border-white/10 bg-[#151515] px-4 py-3 lg:w-80">
          <Search size={18} className="text-[#A6A29A]" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, or ID..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#777]"
          />
        </div>

        <div className="flex gap-2">
          {['All', 'Active', 'Blocked'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`border px-4 py-2 text-xs transition ${
                statusFilter === status
                  ? 'border-[#C6A66B] bg-[#C6A66B] text-black'
                  : 'border-white/10 text-[#A6A29A] hover:border-[#C6A66B]/40 hover:text-[#F5F0E6]'
              }`}
            >
              {status}
            {status !== 'All' && (
              <span className="ml-1.5">
                ({customers.filter((c) => c.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      </div>

      {/* Customers Table */}
      <div className="overflow-hidden border border-white/10 bg-[#151515]">

        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-editorial text-xl">
            All Customers
          </h2>

          <span className="text-xs text-[#A6A29A]">
            {filteredCustomers.length} results
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">

            <thead className="border-b border-white/10 bg-[#0B0B0C]">
              <tr className="text-xs uppercase tracking-wider text-[#A6A29A]">
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Customer ID</th>
                <th className="px-5 py-4 font-medium">Joined</th>
                <th className="px-5 py-4 font-medium">Orders</th>
                <th className="px-5 py-4 font-medium">Total Spent</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="transition hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C6A66B]/20 bg-[#C6A66B]/10 text-sm font-semibold text-[#C6A66B]">
                        {customer.name.charAt(0)}
                      </div>

                      <div>
                        <p className="text-sm font-medium">
                          {customer.name}
                        </p>

                        <p className="mt-1 text-xs text-[#777]">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-xs text-[#C6A66B]">
                    {customer.id}
                  </td>

                  <td className="px-5 py-4 text-sm text-[#A6A29A]">
                    {new Date(customer.joined).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  <td className="px-5 py-4 text-sm">
                    {customer.orders}
                  </td>

                  <td className="px-5 py-4 text-sm font-medium">
                    {formatCurrency(customer.spent)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`border px-2.5 py-1 text-xs ${
                        customer.status === 'Active'
                          ? 'border-green-500/20 bg-green-500/10 text-green-400'
                          : 'border-red-500/20 bg-red-500/10 text-red-400'
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-xs text-[#A6A29A] transition hover:border-[#C6A66B]/40 hover:text-[#C6A66B]"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

          {filteredCustomers.length === 0 && (
            <div className="py-16 text-center text-sm text-[#A6A29A]">
              No customers found.
            </div>
          )}

        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">

          <div className="my-8 w-full max-w-xl border border-[#C6A66B]/20 bg-[#151515]">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#C6A66B]">
                  Customer Profile
                </p>

                <h2 className="mt-2 font-editorial text-2xl">
                  {selectedCustomer.name}
                </h2>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-[#A6A29A] transition hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-6 p-6">

              {/* Customer Info */}
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#C6A66B]/30 bg-[#C6A66B]/10 font-editorial text-2xl text-[#C6A66B]">
                  {selectedCustomer.name.charAt(0)}
                </div>

                <div>
                  <h3 className="text-lg font-medium">
                    {selectedCustomer.name}
                  </h3>

                  <p className="mt-1 text-xs text-[#A6A29A]">
                    {selectedCustomer.id}
                  </p>

                  <span
                    className={`mt-2 inline-block border px-2 py-0.5 text-xs ${
                      selectedCustomer.status === 'Active'
                        ? 'border-green-500/20 bg-green-500/10 text-green-400'
                        : 'border-red-500/20 bg-red-500/10 text-red-400'
                    }`}
                  >
                    {selectedCustomer.status}
                  </span>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-4 border-y border-white/10 py-5">
                <InfoRow
                  icon={Mail}
                  label="Email Address"
                  value={selectedCustomer.email}
                />

                <InfoRow
                  icon={Phone}
                  label="Phone Number"
                  value={selectedCustomer.phone}
                />

                <InfoRow
                  icon={MapPin}
                  label="Location"
                  value={selectedCustomer.location}
                />

                <InfoRow
                  icon={CalendarDays}
                  label="Registration Date"
                  value={new Date(selectedCustomer.joined).toLocaleDateString(
                    'en-IN',
                    {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    }
                  )}
                />
              </div>

              {/* Activity Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-white/10 bg-[#0B0B0C] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#A6A29A]">
                    <ShoppingBag size={16} />
                    <span className="text-xs">Total Orders</span>
                  </div>

                  <p className="text-2xl font-semibold">
                    {selectedCustomer.orders}
                  </p>
                </div>

                <div className="border border-white/10 bg-[#0B0B0C] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#A6A29A]">
                    <IndianRupee size={16} />
                    <span className="text-xs">Total Spent</span>
                  </div>

                  <p className="text-2xl font-semibold text-[#C6A66B]">
                    {formatCurrency(selectedCustomer.spent)}
                  </p>
                </div>
              </div>

              {/* Status Toggle */}
              <button
                onClick={() => toggleCustomerStatus(selectedCustomer.id)}
                className={`w-full border py-3 text-sm transition ${
                  selectedCustomer.status === 'Active'
                    ? 'border-red-500/20 text-red-400 hover:bg-red-500/10'
                    : 'border-green-500/20 text-green-400 hover:bg-green-500/10'
                }`}
              >
                {selectedCustomer.status === 'Active'
                  ? 'Block Customer'
                  : 'Unblock Customer'}
              </button>

              <p className="text-center text-xs text-[#777]">
                Demo mode — customer data is simulated.
              </p>

            </div>

            <div className="border-t border-white/10 p-6">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full border border-white/10 py-3 text-sm text-[#A6A29A] transition hover:border-[#C6A66B]/40 hover:text-[#F5F0E6]"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-[#777]">
        Demo mode — changes are stored locally and reset on refresh.
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

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="mt-0.5 text-[#C6A66B]" />

      <div>
        <p className="text-xs text-[#777]">{label}</p>
        <p className="mt-1 text-sm text-[#F5F0E6]">{value}</p>
      </div>
    </div>
  )
}
