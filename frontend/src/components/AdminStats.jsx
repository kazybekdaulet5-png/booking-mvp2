import { Ban, CalendarCheck, Clock3, TrendingUp, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { api } from '../api.js'
import { toDateStr, todayDate } from '../dateUtils.js'

const PERIODS = [
  { key: '7d', label: '7 дней' },
  { key: '30d', label: '30 дней' },
  { key: 'all', label: 'Всё время' },
]

function periodRange(period) {
  if (period === 'all') return { dateFrom: undefined, dateTo: undefined }

  const days = period === '7d' ? 7 : 30
  const to = todayDate()
  const from = new Date(to)
  from.setDate(from.getDate() - (days - 1))
  return { dateFrom: toDateStr(from), dateTo: toDateStr(to) }
}

function KpiCard({ icon: Icon, label, value, tone }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    gray: 'bg-gray-100 text-gray-500',
  }
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-lg font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  )
}

export default function AdminStats() {
  const [period, setPeriod] = useState('30d')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { dateFrom, dateTo } = periodRange(period)
    setLoading(true)
    setError('')
    api
      .getStatsOverview(dateFrom, dateTo)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [period])

  const revenueChartData = useMemo(
    () => (data?.revenue_by_day || []).map((d) => ({ date: d.date.slice(5), revenue: d.revenue })),
    [data]
  )

  const resourceChartData = useMemo(
    () =>
      (data?.popular_resources || [])
        .slice(0, 6)
        .map((r) => ({ name: r.name, bookings: r.bookings_count })),
    [data]
  )

  const slotChartData = useMemo(
    () =>
      (data?.popular_slots || [])
        .slice(0, 8)
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
        .map((s) => ({ time: s.start_time, count: s.count })),
    [data]
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="text-sm text-gray-500">Период</div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                period === p.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>
      )}

      {loading && <div className="text-sm text-gray-400 py-8 text-center">Загрузка статистики...</div>}

      {!loading && data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <KpiCard icon={CalendarCheck} label="Всего броней" value={data.total_bookings} tone="indigo" />
            <KpiCard icon={Wallet} label="Выручка" value={`${data.total_revenue.toLocaleString('ru-RU')} ₸`} tone="emerald" />
            <KpiCard icon={Clock3} label="Ожидают" value={data.pending_bookings} tone="amber" />
            <KpiCard icon={Ban} label="Отменено" value={data.cancelled_bookings} tone="gray" />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-indigo-600" />
              <div className="text-sm font-semibold text-gray-900">Выручка по дням</div>
            </div>
            {revenueChartData.length === 0 ? (
              <div className="text-sm text-gray-400 py-8 text-center">Нет подтверждённых броней за период</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip formatter={(v) => [`${v.toLocaleString('ru-RU')} ₸`, 'Выручка']} />
                  <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-sm font-semibold text-gray-900 mb-4">Популярные ресурсы</div>
              {resourceChartData.length === 0 ? (
                <div className="text-sm text-gray-400 py-8 text-center">Нет данных</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={resourceChartData} layout="vertical" margin={{ left: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      tick={{ fontSize: 11, fill: '#475569' }}
                    />
                    <Tooltip formatter={(v) => [v, 'Броней']} />
                    <Bar dataKey="bookings" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-sm font-semibold text-gray-900 mb-4">Популярное время</div>
              {slotChartData.length === 0 ? (
                <div className="text-sm text-gray-400 py-8 text-center">Нет данных</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={slotChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                    <Tooltip formatter={(v) => [v, 'Броней']} />
                    <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
