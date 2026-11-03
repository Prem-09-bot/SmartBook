import { useState } from 'react'
import {
  Search,
  Eye,
  X,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  IndianRupee,
  Package,
} from 'lucide-react'

const initialOrders = [
  {
    id: 'SB-1001',
    customer: 'Rahul Sharma',
    email: 'rahul@example.com',
    date: '2026-10-18',
    items: [
      { name: 'The Silent Patient', quantity: 1, price: 349 },
      { name: 'Atomic Habits', quantity: 1, price: 499 },
    ],
    subtotal: 848,
    delivery: 49,
    total: 897,
    payment: 'UPI',
    status: 'Delivered',
    address: 'Kolkata, West Bengal, India',
  },
  {
    id: 'SB-1002',
    customer: 'Priya Das',
    email: 'priya@example.com',
    date: '2026-10-18',
    items: [{ name: 'The Psychology of Money', quantity: 2, price: 299 }],
    subtotal: 598,
    delivery: 49,
    total: 647,
    payment: 'Cash on Delivery',
    status: 'Processing',
    address: 'Howrah, West Bengal, India',
  },
  {
    id: 'SB-1003',
    customer: 'Amit Roy',
    email: 'amit@example.com',
    date: '2026-10-17',
    items: [{ name: 'Ikigai', quantity: 1, price: 399 }],
    subtotal: 399,
    delivery: 49,
    total: 448,
    payment: 'Card',
    status: 'Shipped',
    address: 'Durgapur, West Bengal, India',
  },
  {
    id: 'SB-1004',
    customer: 'Sneha Gupta',
    email: 'sneha@example.com',
    date: '2026-10-17',
    items: [{ name: 'Deep Work', quantity: 1, price: 449 }],
    subtotal: 449,
    delivery: 49,
    total: 498,
    payment: 'UPI',
    status: 'Pending',
    address: 'Siliguri, West Bengal, India',
  },
  {
    id: 'SB-1005',
    customer: 'Arjun Sen',
    email: 'arjun@example.com',
    date: '2026-10-16',
    items: [{ name: 'The Alchemist', quantity: 1, price: 299 }],
    subtotal: 299,
    delivery: 49,
    total: 348,
    payment: 'Cash on Delivery',
    status: 'Cancelled',
    address: 'Asansol, West Bengal, India',
  },
  {
    id: 'SB-1006',
    customer: 'Meera Banerjee',
    email: 'meera@example.com',
    date: '2026-10-16',
    items: [
      { name: '1984', quantity: 1, price: 249 },
      { name: 'Rich Dad Poor Dad', quantity: 1, price: 399 },
    ],
    subtotal: 648,
    delivery: 49,
    total: 697,
    payment: 'UPI',
    status: 'Processing',
    address: 'Kolkata, West Bengal, India',
  },
]

const statusStyles = {
  Pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const statusIcons = {
  Pending: Clock,
  Processing: Package,
  Shipped: Truck,
  Delivered: CheckCircle,
  Cancelled: XCircle,
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

export default function AdminOrders() {
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const statuses = [
    'All',
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
  ]

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.email.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus }
          : order
      )
    )

    setSelectedOrder((prev) =>
      prev && prev.id === orderId
        ? { ...prev, status: newStatus }
        : prev
    )
  }

  const totalRevenue = orders
    .filter((order) => order.status === 'Delivered')
    .reduce((sum, order) => sum + order.total, 0)

  const pendingOrders = orders.filter(
    (order) => order.status === 'Pending'
  ).length

  const processingOrders = orders.filter(
    (order) => order.status === 'Processing'
  ).length

  const deliveredOrders = orders.filter(
    (order) => order.status === 'Delivered'
  ).length

  return (
    <div className="min-h-screen bg-[#0B0B0C] px-4 py-8 text-[#F5F0E6] sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#C6A66B]">
          Store Management
        </p>

        <h1 className="font-editorial text-3xl sm:text-4xl">
          Orders
        </h1>

        <p className="mt-2 text-sm text-[#A6A29A]">
          Track, manage, and fulfill customer orders.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Orders"
          value={orders.length}
          icon={ShoppingBag}
          color="text-[#C6A66B]"
        />

        <StatCard
          title="Pending Orders"
          value={pendingOrders}
          icon={Clock}
          color="text-yellow-400"
        />

        <StatCard
          title="Processing"
          value={processingOrders}
          icon={Package}
          color="text-blue-400"
        />

        <StatCard
          title="Delivered Revenue"
          value={formatCurrency(totalRevenue)}
          icon={IndianRupee}
          color="text-green-400"
        />

      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-3 border border-white/10 bg-[#151515] px-4 py-3 lg:w-80">
          <Search size={18} className="text-[#A6A29A]" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order or customer..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#777]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`border px-3 py-2 text-xs transition ${
                statusFilter === status
                  ? 'border-[#C6A66B] bg-[#C6A66B] text-black'
                  : 'border-white/10 text-[#A6A29A] hover:border-[#C6A66B]/40 hover:text-[#F5F0E6]'
              }`}
            >
              {status}
            {status !== 'All' && (
              <span className="ml-1.5">
                ({orders.filter((o) => o.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      </div>

      {/* Orders Table */}
      <div className="overflow-hidden border border-white/10 bg-[#151515]">

        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-editorial text-xl">
            All Orders
          </h2>

          <span className="text-xs text-[#A6A29A]">
            {filteredOrders.length} results
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">

            <thead className="border-b border-white/10 bg-[#0B0B0C]">
              <tr className="text-xs uppercase tracking-wider text-[#A6A29A]">
                <th className="px-5 py-4 font-medium">Order ID</th>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Date</th>
                <th className="px-5 py-4 font-medium">Amount</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order) => {
                const StatusIcon = statusIcons[order.status]

                return (
                  <tr
                    key={order.id}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-[#C6A66B]">
                        #{order.id}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm">{order.customer}</p>
                      <p className="mt-1 text-xs text-[#777]">
                        {order.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-[#A6A29A]">
                      {new Date(order.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium">
                      {formatCurrency(order.total)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs ${statusStyles[order.status]}`}
                      >
                        <StatusIcon size={13} />
                        {order.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-xs text-[#A6A29A] transition hover:border-[#C6A66B]/40 hover:text-[#C6A66B]"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>

          </table>

          {filteredOrders.length === 0 && (
            <div className="py-16 text-center text-sm text-[#A6A29A]">
              No orders found.
            </div>
          )}

        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">

          <div className="my-8 w-full max-w-2xl border border-[#C6A66B]/20 bg-[#151515]">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#C6A66B]">
                  Order Details
                </p>

                <h2 className="mt-2 font-editorial text-2xl">
                  #{selectedOrder.id}
                </h2>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[#A6A29A] transition hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-6 p-6">

              {/* Customer Details */}
              <div>
                <h3 className="mb-3 text-xs uppercase tracking-wider text-[#C6A66B]">
                  Customer Information
                </h3>

                <p className="text-sm">{selectedOrder.customer}</p>
                <p className="mt-1 text-sm text-[#A6A29A]">
                  {selectedOrder.email}
                </p>
                <p className="mt-2 text-sm text-[#A6A29A]">
                  {selectedOrder.address}
                </p>
              </div>

              {/* Items */}
              <div>
                <h3 className="mb-3 text-xs uppercase tracking-wider text-[#C6A66B]">
                  Ordered Items
                </h3>

                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b border-white/5 pb-3"
                    >
                      <div>
                        <p className="text-sm">{item.name}</p>
                        <p className="mt-1 text-xs text-[#A6A29A]">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="text-sm">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="space-y-2 border-t border-white/10 pt-4">
                <div className="flex justify-between text-sm text-[#A6A29A]">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm text-[#A6A29A]">
                  <span>Delivery</span>
                  <span>{formatCurrency(selectedOrder.delivery)}</span>
                </div>

                <div className="flex justify-between border-t border-white/10 pt-3 text-base font-semibold">
                  <span>Total</span>
                  <span className="text-[#C6A66B]">
                    {formatCurrency(selectedOrder.total)}
                  </span>
                </div>

                <p className="pt-2 text-xs text-[#A6A29A]">
                  Payment Method: {selectedOrder.payment}
                </p>
              </div>

              {/* Update Status */}
              <div>
                <h3 className="mb-3 text-xs uppercase tracking-wider text-[#C6A66B]">
                  Update Order Status
                </h3>

                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    updateOrderStatus(selectedOrder.id, e.target.value)
                  }
                  className="w-full border border-white/10 bg-[#0B0B0C] px-4 py-3 text-sm text-[#F5F0E6] outline-none focus:border-[#C6A66B]/50"
                >
                  {statuses
                    .filter((status) => status !== 'All')
                    .map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                </select>
              </div>

            </div>

            <div className="border-t border-white/10 p-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full border border-white/10 py-3 text-sm text-[#A6A29A] transition hover:border-[#C6A66B]/40 hover:text-[#F5F0E6]"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Demo Notice */}
      <p className="mt-8 text-center text-xs text-[#777]">
        Demo mode — order data is simulated and resets on refresh.
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
