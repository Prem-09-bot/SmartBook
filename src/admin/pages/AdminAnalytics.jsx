import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingBag,
  Users,
  BookOpen,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from 'lucide-react'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const monthlyRevenue = [
  { month: 'Jan', revenue: 42000, orders: 120 },
  { month: 'Feb', revenue: 58000, orders: 145 },
  { month: 'Mar', revenue: 49000, orders: 130 },
  { month: 'Apr', revenue: 72000, orders: 180 },
  { month: 'May', revenue: 65000, orders: 160 },
  { month: 'Jun', revenue: 89000, orders: 210 },
  { month: 'Jul', revenue: 78000, orders: 190 },
  { month: 'Aug', revenue: 96000, orders: 240 },
  { month: 'Sep', revenue: 85000, orders: 205 },
  { month: 'Oct', revenue: 112000, orders: 275 },
  { month: 'Nov', revenue: 105000, orders: 260 },
  { month: 'Dec', revenue: 135000, orders: 320 },
]

const topBooks = [
  { title: 'The Silent Patient', author: 'Alex Michaelides', sales: 1240, revenue: 434760 },
  { title: 'Atomic Habits', author: 'James Clear', sales: 980, revenue: 489020 },
  { title: 'Ikigai', author: 'Hector Garcia', sales: 865, revenue: 259500 },
  { title: 'The Psychology of Money', author: 'Morgan Housel', sales: 742, revenue: 296800 },
  { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', sales: 690, revenue: 241500 },
]

const categoryData = [
  { name: 'Fiction', value: 35 },
  { name: 'Self Help', value: 25 },
  { name: 'Business', value: 18 },
  { name: 'Mystery', value: 12 },
  { name: 'Others', value: 10 },
]

const customerGrowth = [
  { month: 'Jan', customers: 120 },
  { month: 'Feb', customers: 180 },
  { month: 'Mar', customers: 250 },
  { month: 'Apr', customers: 320 },
  { month: 'May', customers: 410 },
  { month: 'Jun', customers: 520 },
  { month: 'Jul', customers: 610 },
  { month: 'Aug', customers: 740 },
  { month: 'Sep', customers: 860 },
  { month: 'Oct', customers: 980 },
  { month: 'Nov', customers: 1120 },
  { month: 'Dec', customers: 1350 },
]

const COLORS = ['#C6A66B', '#8B7355', '#6D5D45', '#A6A29A', '#55514A']

const formatCurrency = (value) =>
  `₹${Number(value).toLocaleString('en-IN')}`

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  return (
    <div className="border border-[#C6A66B]/30 bg-[#151515] px-4 py-3 shadow-xl">
      <p className="mb-2 text-xs text-[#A6A29A]">{label}</p>

      {payload.map((item, index) => (
        <p key={index} className="text-sm font-medium text-[#C6A66B]">
          {item.name === 'Revenue'
            ? formatCurrency(item.value)
            : `${item.name}: ${item.value}`}
        </p>
      ))}
    </div>
  )
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('Yearly')

  const stats = [
    {
      title: 'Total Revenue',
      value: '₹9,56,000',
      growth: '+18.4%',
      positive: true,
      icon: IndianRupee,
      description: 'Compared to last period',
    },
    {
      title: 'Total Orders',
      value: '2,495',
      growth: '+12.8%',
      positive: true,
      icon: ShoppingBag,
      description: 'Compared to last period',
    },
    {
      title: 'Total Customers',
      value: '8,642',
      growth: '+24.6%',
      positive: true,
      icon: Users,
      description: 'Compared to last period',
    },
    {
      title: 'Books Sold',
      value: '12,845',
      growth: '-2.4%',
      positive: false,
      icon: BookOpen,
      description: 'Compared to last period',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0B0B0C] px-4 py-8 text-[#F5F0E6] sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#C6A66B]">
            Business Intelligence
          </p>

          <h1 className="font-editorial text-3xl sm:text-4xl">
            Analytics Overview
          </h1>

          <p className="mt-2 text-sm text-[#A6A29A]">
            Track your store performance and business growth.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-white/10 bg-[#151515] px-3 py-2.5">
            <CalendarDays size={16} className="text-[#C6A66B]" />

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-sm text-[#F5F0E6] outline-none"
            >
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>

          <button
            onClick={() => alert('Analytics report export coming soon.')}
            className="flex items-center gap-2 bg-[#C6A66B] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#D8BC83]"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.title}
              className="border border-[#C6A66B]/20 bg-[#151515] p-5 transition hover:border-[#C6A66B]/40"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-[#A6A29A]">{stat.title}</p>

                <div className="bg-[#C6A66B]/10 p-2.5 text-[#C6A66B]">
                  <Icon size={20} />
                </div>
              </div>

              <h2 className="font-editorial text-2xl sm:text-3xl">
                {stat.value}
              </h2>

              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`flex items-center gap-1 text-xs ${
                    stat.positive ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {stat.positive ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  {stat.growth}
                </span>

                <span className="text-xs text-[#777]">
                  {stat.description}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Revenue Chart */}
      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">

        <div className="border border-white/10 bg-[#151515] p-5 xl:col-span-2 sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-editorial text-xl sm:text-2xl">
                Revenue Overview
              </h2>

              <p className="mt-1 text-xs text-[#A6A29A]">
                Monthly revenue performance
              </p>
            </div>

            <span className="flex items-center gap-2 text-xs text-green-400">
              <TrendingUp size={15} />
              +18.4%
            </span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="#C6A66B"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="#C6A66B"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#ffffff"
                  strokeOpacity={0.06}
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  stroke="#777"
                  tick={{ fill: '#A6A29A', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  stroke="#777"
                  tick={{ fill: '#A6A29A', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />

                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#C6A66B"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  activeDot={{ r: 5, fill: '#C6A66B' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="border border-white/10 bg-[#151515] p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="font-editorial text-xl sm:text-2xl">
              Sales by Category
            </h2>

            <p className="mt-1 text-xs text-[#A6A29A]">
              Category-wise distribution
            </p>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    backgroundColor: '#151515',
                    border: '1px solid #C6A66B',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {categoryData.map((category, index) => (
              <div
                key={category.name}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 text-[#A6A29A]">
                  <span
                    className="h-2.5 w-2.5"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  {category.name}
                </div>

                <span className="text-[#F5F0E6]">{category.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders & Customer Growth */}
      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

        <div className="border border-white/10 bg-[#151515] p-5 sm:p-6">
          <div className="mb-6">
            <h2 className="font-editorial text-xl sm:text-2xl">
              Order Performance
            </h2>

            <p className="mt-1 text-xs text-[#A6A29A]">
              Monthly order volume
            </p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid
                  stroke="#ffffff"
                  strokeOpacity={0.06}
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  stroke="#777"
                  tick={{ fill: '#A6A29A', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  stroke="#777"
                  tick={{ fill: '#A6A29A', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip content={<CustomTooltip />} />

                <Bar
                  dataKey="orders"
                  name="Orders"
                  fill="#C6A66B"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-white/10 bg-[#151515] p-5 sm:p-6">
          <div className="mb-6">
            <h2 className="font-editorial text-xl sm:text-2xl">
              Customer Growth
            </h2>

            <p className="mt-1 text-xs text-[#A6A29A]">
              New customer acquisition
            </p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={customerGrowth}>
                <defs>
                  <linearGradient id="customerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="#8B7355"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="#8B7355"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#ffffff"
                  strokeOpacity={0.06}
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  stroke="#777"
                  tick={{ fill: '#A6A29A', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  stroke="#777"
                  tick={{ fill: '#A6A29A', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="customers"
                  name="Customers"
                  stroke="#8B7355"
                  strokeWidth={2.5}
                  fill="url(#customerGradient)"
                  activeDot={{ r: 5, fill: '#C6A66B' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Selling Books */}
      <div className="border border-white/10 bg-[#151515]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-editorial text-xl sm:text-2xl">
              Top Selling Books
            </h2>

            <p className="mt-1 text-xs text-[#A6A29A]">
              Best performing titles in your store
            </p>
          </div>

          <span className="text-xs text-[#C6A66B]">Top 5</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead className="border-b border-white/10 bg-[#0B0B0C]">
              <tr className="text-xs uppercase tracking-wider text-[#A6A29A]">
                <th className="px-5 py-4 font-medium">Rank</th>
                <th className="px-5 py-4 font-medium">Book</th>
                <th className="px-5 py-4 font-medium">Units Sold</th>
                <th className="px-5 py-4 text-right font-medium">Revenue</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {topBooks.map((book, index) => (
                <tr
                  key={book.title}
                  className="transition hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <span
                      className={`flex h-8 w-8 items-center justify-center text-xs font-semibold ${
                        index === 0
                          ? 'bg-[#C6A66B] text-black'
                          : 'bg-white/5 text-[#A6A29A]'
                      }`}
                    >
                      #{index + 1}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-medium">{book.title}</p>
                    <p className="mt-1 text-xs text-[#A6A29A]">{book.author}</p>
                  </td>

                  <td className="px-5 py-4 text-sm text-[#A6A29A]">
                    {book.sales.toLocaleString('en-IN')}
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-medium text-[#C6A66B]">
                    {formatCurrency(book.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demo Notice */}
      <p className="mt-8 text-center text-xs text-[#777]">
        Demo analytics — sample data displayed. Live reports will be available
        after backend integration.
      </p>
    </div>
  )
}
