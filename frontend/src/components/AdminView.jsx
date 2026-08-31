import { BarChart3, CalendarDays } from 'lucide-react'
import { useState } from 'react'

import AdminSchedule from './AdminSchedule.jsx'
import AdminStats from './AdminStats.jsx'

export default function AdminView() {
  const [tab, setTab] = useState('schedule')

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h1 className="text-lg font-semibold text-gray-900">Админ-панель</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTab('schedule')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              tab === 'schedule' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            }`}
          >
            <CalendarDays size={14} /> Расписание
          </button>
          <button
            onClick={() => setTab('stats')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              tab === 'stats' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            }`}
          >
            <BarChart3 size={14} /> Аналитика
          </button>
        </div>
      </div>

      {tab === 'schedule' ? <AdminSchedule /> : <AdminStats />}
    </div>
  )
}
