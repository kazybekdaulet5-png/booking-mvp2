import { Ban, CheckCircle, Plus, Wallet, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { api } from '../api.js'
import { todayStr } from '../dateUtils.js'
import Calendar from './Calendar.jsx'

const WORK_START = 10
const WORK_END = 23

function buildSlots() {
  const slots = []
  for (let h = WORK_START; h < WORK_END; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
  }
  return slots
}

const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-gray-100 text-gray-400 border-gray-200 line-through',
}

const STATUS_LABEL = {
  PENDING: 'Ожидает',
  CONFIRMED: 'Подтверждена',
  CANCELLED: 'Отменена',
}

export default function AdminSchedule() {
  const [resources, setResources] = useState([])
  const [date, setDate] = useState(todayStr())
  const [showCalendar, setShowCalendar] = useState(false)
  const [bookings, setBookings] = useState([])
  const [resourceFilter, setResourceFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    resource_id: '',
    client_name: '',
    client_phone: '',
    start_time: '',
    end_time: '',
  })

  const slots = useMemo(() => buildSlots(), [])
  const endSlots = useMemo(() => [...slots.slice(1), `${WORK_END}:00`], [slots])

  useEffect(() => {
    api.getResources().then(setResources).catch((e) => setError(e.message))
  }, [])

  async function loadBookings() {
    try {
      const data = await api.getBookings(date)
      setBookings(data)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    loadBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const filteredResources =
    resourceFilter === 'all' ? resources : resources.filter((r) => r.id === Number(resourceFilter))

  const revenue = bookings
    .filter((b) => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + b.total_price, 0)

  function bookingFor(resourceId, slotStart) {
    return bookings.find(
      (b) => b.resource_id === resourceId && b.start_time <= slotStart && b.end_time > slotStart
    )
  }

  async function handleStatusChange(id, status) {
    try {
      await api.updateBookingStatus(id, status)
      loadBookings()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleAddBooking(e) {
    e.preventDefault()
    setError('')
    try {
      await api.createBooking({
        resource_id: Number(form.resource_id),
        client_name: form.client_name,
        client_phone: form.client_phone,
        date,
        start_time: form.start_time,
        end_time: form.end_time,
      })
      setShowForm(false)
      setForm({ resource_id: '', client_name: '', client_phone: '', start_time: '', end_time: '' })
      loadBookings()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCalendar((v) => !v)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700"
          >
            📅 {date}
          </button>
          {showCalendar && (
            <div className="absolute z-30 mt-2">
              <Calendar
                selectedDateStr={date}
                onSelect={(d) => {
                  setDate(d)
                  setShowCalendar(false)
                }}
                maxMonthsAhead={12}
              />
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="all">Все ресурсы</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 bg-indigo-600 text-white rounded-lg px-3 py-2 text-sm font-medium"
          >
            <Plus size={16} /> Бронь
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>
      )}

      <div className="mb-5 flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 w-fit">
        <Wallet className="text-emerald-600" size={18} />
        <span className="text-sm text-emerald-700">
          Выручка за день (подтверждённые): <b>{revenue.toLocaleString('ru-RU')} ₸</b>
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-3 py-2 font-medium text-gray-500 sticky left-0 bg-gray-50">
                Ресурс
              </th>
              {slots.map((s) => (
                <th key={s} className="px-2 py-2 font-medium text-gray-400 text-xs">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredResources.map((r) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="px-3 py-2 font-medium text-gray-700 whitespace-nowrap sticky left-0 bg-white">
                  {r.name}
                </td>
                {slots.map((s) => {
                  const b = bookingFor(r.id, s)
                  if (!b) {
                    return (
                      <td key={s} className="px-2 py-2 text-center text-gray-200">
                        ·
                      </td>
                    )
                  }
                  return (
                    <td key={s} className="px-1 py-1">
                      <div
                        className={`rounded-md border px-1.5 py-1 text-[10px] leading-tight ${STATUS_STYLES[b.status]}`}
                        title={`${b.client_name} · ${b.client_phone}`}
                      >
                        <div className="font-medium truncate">{b.client_name}</div>
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <span>{STATUS_LABEL[b.status]}</span>
                          <div className="flex gap-1">
                            {b.status !== 'CONFIRMED' && (
                              <button
                                type="button"
                                title="Подтвердить"
                                onClick={() => handleStatusChange(b.id, 'CONFIRMED')}
                              >
                                <CheckCircle size={12} />
                              </button>
                            )}
                            {b.status !== 'CANCELLED' && (
                              <button
                                type="button"
                                title="Отменить"
                                onClick={() => handleStatusChange(b.id, 'CANCELLED')}
                              >
                                <Ban size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-20">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm relative">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-400"
            >
              <X size={18} />
            </button>
            <h2 className="text-base font-semibold mb-4">Новая бронь</h2>
            <form onSubmit={handleAddBooking} className="flex flex-col gap-3">
              <select
                required
                value={form.resource_id}
                onChange={(e) => setForm({ ...form, resource_id: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">Выберите ресурс</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <input
                required
                type="text"
                placeholder="Имя клиента"
                value={form.client_name}
                onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                required
                type="tel"
                placeholder="Телефон"
                value={form.client_phone}
                onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <select
                  required
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">С</option>
                  {slots.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <select
                  required
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">До</option>
                  {endSlots.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium mt-2"
              >
                Добавить бронь
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
