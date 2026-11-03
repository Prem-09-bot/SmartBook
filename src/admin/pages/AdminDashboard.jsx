import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  BookOpen,
  IndianRupee,
  ArrowUpRight,
  Clock,
} from 'lucide-react'

const salesData = [
  { name: 'Mon', sales: 12000 },
  { name: 'Tue', sales: 18000 },
  { name: 'Wed', sales: 15000 },
  { name: 'Thu', sales: 25000 },
  { name: 'Fri', sales: 22000 },
  { name: 'Sat', sales: 32000 },
  { name: 'Sun', sales: 28000 },
]

const recentOrders = [
  {
    id: '#SB-1001',
    customer: 'Rahul Sharma',
    email: 'rahul@example.com',
    amount: 1299,
    status: 'Delivered',
  },
  {
    id: '#SB-1002',
    customer: 'Priya Das',
    email: 'priya@example.com',
    amount: 849,
    status: 'Processing',
  },
  {
    id: '#SB-1003',
    customer: 'Arjun Roy',
    email: 'arjun@example.com',
    amount: 2199,
    status: 'Pending',
  },
  {
    id: '#SB-1004',
    customer: 'Sneha Gupta',
    email: 'sneha@example.com',
    amount: 599,
    status: 'Delivered',
  },
  {
    id: '#SB-1005',
    customer: 'Amit Verma',
    email: 'amit@example.com',
    amount: 1599,
    status: 'Cancelled',
  },
]

const stats = [
  {
    title: 'Total Revenue',
    value: '₹1,24,580',
    change: '+12.8%',
    positive: true,
    icon: IndianRupee,
  },
  {
    title: 'Total Orders',
    value: '1,284',
    change: '+8.2%',
    positive: true,
    icon: ShoppingBag,
  },
  {
    title: 'Total Customers',
    value: '856',
    change: '+5.4%',
    positive: true,
    icon: Users,
  },
  {
    title: 'Total Books',
    value: '2,450',
    change: '-2.1%',
    positive: false,
    icon: BookOpen,
  },
]

function StatCard({ title, value, change, positive, icon: Icon }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#151515] p-5 transition hover:border-[#C6A66B]/30">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#A6A29A]">{title}</p>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C6A66B]/10">
          <Icon size={18} className="text-[#C6A66B]" />
        </div>
      </div>

      <h3 className="mt-4 text-2xl font-semibold text-[#F5F0E6]">
        {value}
      </h3>

      <div className="mt-3 flex items-center gap-2 text-xs">
        {positive ? (
          <TrendingUp size={14} className="text-emerald-400" />
        ) : (
          <TrendingDown size={14} className="text-red-400" />
        )}

        <span className={positive ? 'text-emerald-400' : 'text-red-400'}>
          {change}
        </span>

        <span className="text-[#77736C]">vs last week</span>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    Delivered: 'bg-emerald-500/10 text-emerald-400',
    Processing: 'bg-blue-500/10 text-blue-400',
    Pending: 'bg-amber-500/10 text-amber-400',
    Cancelled: 'bg-red-500/10 text-red-400',
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs ${
        styles[status] || 'bg-white/10 text-white'
      }`}
    >
      {status}
    </span>
  )
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#C6A66B]">
            SmartBook Administration
          </p>

          <h1 className="mt-2 font-editorial text-3xl text-[#F5F0E6] sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-[#A6A29A]">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm text-[#A6A29A]">
          <Clock size={16} className="text-[#C6A66B]" />
          Last 7 days
        </div>
      </div>

      {/* Demo Data Notice */}
      <div className="mb-6 rounded-lg border border-[#C6A66B]/20 bg-[#C6A66B]/5 px-4 py-3 text-xs text-[#A6A29A]">
        Dashboard currently displays sample data. Live statistics will appear
        after backend integration.
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="mt-8 rounded-xl border border-white/10 bg-[#151515] p-5 sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-[#F5F0E6]">
              Revenue Overview
            </h2>

            <p className="mt-1 text-xs text-[#A6A29A]">
              Weekly revenue performance
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <TrendingUp size={15} />
            +18.6% this week
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={salesData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="#C6A66B"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="#C6A66B"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                stroke="#77736C"
                tick={{ fill: '#A6A29A', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                stroke="#77736C"
                tick={{ fill: '#A6A29A', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `₹${value / 1000}k`}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#151515',
                  border: '1px solid rgba(198,166,107,0.25)',
                  borderRadius: '8px',
                  color: '#F5F0E6',
                }}
                formatter={(value) => [
                  `₹${value.toLocaleString('en-IN')}`,
                  'Revenue',
                ]}
                labelStyle={{ color: '#A6A29A' }}
              />

              <Area
                type="monotone"
                dataKey="sales"
                stroke="#C6A66B"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                activeDot={{
                  r: 5,
                  fill: '#C6A66B',
                  stroke: '#0B0B0C',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-[#151515]">
        <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-medium text-[#F5F0E6]">
              Recent Orders
            </h2>

            <p className="mt-1 text-xs text-[#A6A29A]">
              Latest activity from your store
            </p>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 text-xs text-[#C6A66B] transition hover:text-[#E0C58A]"
          >
            View all
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs text-[#77736C]">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-white/5 transition hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4 text-sm text-[#C6A66B]">
                    {order.id}
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm text-[#F5F0E6]">
                      {order.customer}
                    </p>

                    <p className="mt-1 text-xs text-[#77736C]">
                      {order.email}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#F5F0E6]">
                    ₹{order.amount.toLocaleString('en-IN')}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-[#77736C]">
        SmartBook Admin Panel · Demo Version
      </p>
    </div>
  )
}