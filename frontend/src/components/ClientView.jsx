import {
  CheckCircle2,
  CircleDot,
  Clock,
  Gamepad2,
  Loader2,
  Scissors,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { api } from '../api.js'
import { todayStr } from '../dateUtils.js'
import Calendar from './Calendar.jsx'

const CATEGORY_ICONS = {
  PS5: Gamepad2,
  Бильярд: CircleDot,
  Барбер: Scissors,
}

const WORK_START = 10 // 10:00
const WORK_END = 23 // последний слот 22:00–23:00

function buildSlots() {
  const slots = []
  for (let h = WORK_START; h < WORK_END; h++) {
    slots.push({
      start: `${String(h).padStart(2, '0')}:00`,
      end: `${String(h + 1).padStart(2, '0')}:00`,
    })
  }
  return slots
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export default function ClientView() {
  const [resources, setResources] = useState([])
  const [category, setCategory] = useState(null)
  const [resourceId, setResourceId] = useState(null)
  const [date, setDate] = useState(todayStr())
  const [bookings, setBookings] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    api.getResources().then(setResources).catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    // Подставляем имя из Telegram, если открыто внутри Telegram WebApp
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
    if (tgUser) {
      setName([tgUser.first_name, tgUser.last_name].filter(Boolean).join(' '))
    }
  }, [])

  useEffect(() => {
    if (!date) return
    api.getBookings(date).then(setBookings).catch((e) => setError(e.message))
  }, [date])

  const categories = useMemo(() => [...new Set(resources.map((r) => r.category))], [resources])

  const resourcesInCategory = useMemo(
    () => resources.filter((r) => r.category === category),
    [resources, category]
  )

  const selectedResource = resources.find((r) => r.id === resourceId)
  const slots = useMemo(() => buildSlots(), [])

  const takenRanges = useMemo(
    () =>
      bookings
        .filter((b) => b.resource_id === resourceId && b.status !== 'CANCELLED')
        .map((b) => [timeToMinutes(b.start_time), timeToMinutes(b.end_time)]),
    [bookings, resourceId]
  )

  function isSlotTaken(slot) {
    const s = timeToMinutes(slot.start)
    const e = timeToMinutes(slot.end)
    return takenRanges.some(([ts, te]) => s < te && ts < e)
  }

  function reset() {
    setCategory(null)
    setResourceId(null)
    setSelectedSlot(null)
    setDate(todayStr())
    setName('')
    setPhone('')
  }

  async function handleSubmit() {
    if (!resourceId || !selectedSlot || !name || !phone) return
    setLoading(true)
    setError('')
    try {
      await api.createBooking({
        resource_id: resourceId,
        client_name: name,
        client_phone: phone,
        date,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
      })
      setSuccess(true)
      const fresh = await api.getBookings(date)
      setBookings(fresh)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={56} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Бронь принята!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Мы свяжемся с вами для подтверждения. Статус брони — «в ожидании».
          </p>
          <button
            onClick={() => {
              setSuccess(false)
              reset()
            }}
            className="w-full bg-indigo-600 text-white rounded-xl py-3 text-sm font-medium hover:bg-indigo-700 transition"
          >
            Новая бронь
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      <h1 className="text-lg font-semibold text-gray-900 mb-4">Забронировать</h1>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>
      )}

      {/* Категория — кликабельные карточки */}
      <div className="mb-5">
        <div className="text-xs font-medium text-gray-500 mb-2">Категория</div>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] || Clock
            return (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat)
                  setResourceId(null)
                  setSelectedSlot(null)
                }}
                className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-medium transition ${
                  category === cat
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <Icon size={18} />
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Ресурс — кликабельные карточки */}
      {category && (
        <div className="mb-5">
          <div className="text-xs font-medium text-gray-500 mb-2">Выберите</div>
          <div className="flex flex-col gap-2">
            {resourcesInCategory.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setResourceId(r.id)
                  setSelectedSlot(null)
                }}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                  resourceId === r.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                }`}
              >
                <span className="font-medium text-gray-800">{r.name}</span>
                <span className="text-gray-500">{r.price_per_hour} ₸/час</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Дата — только кликабельный календарь, без ручного ввода */}
      {resourceId && (
        <div className="mb-5">
          <div className="text-xs font-medium text-gray-500 mb-2">Дата</div>
          <Calendar
            selectedDateStr={date}
            onSelect={(d) => {
              setDate(d)
              setSelectedSlot(null)
            }}
          />
        </div>
      )}

      {/* Время — клик по слотам */}
      {resourceId && date && (
        <div className="mb-5">
          <div className="text-xs font-medium text-gray-500 mb-2">Свободное время</div>
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => {
              const taken = isSlotTaken(slot)
              const selected = selectedSlot && selectedSlot.start === slot.start
              return (
                <button
                  key={slot.start}
                  disabled={taken}
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-lg py-2 text-xs font-medium border transition ${
                    taken
                      ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                      : selected
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  {slot.start}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Контакты — единственные текстовые поля, нужны для связи с клиентом */}
      {selectedSlot && (
        <div className="mb-6 flex flex-col gap-3">
          <div>
            <div className="text-xs font-medium text-gray-500 mb-2">Ваше имя</div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Имя"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
            />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 mb-2">Телефон</div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (___) ___-__-__"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
            />
          </div>
        </div>
      )}

      {selectedSlot && selectedResource && (
        <div className="mb-4 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600 flex justify-between">
          <span>Итого</span>
          <span className="font-semibold text-gray-900">{selectedResource.price_per_hour} ₸</span>
        </div>
      )}

      {selectedSlot && (
        <button
          onClick={handleSubmit}
          disabled={!name || !phone || loading}
          className="w-full bg-indigo-600 disabled:bg-gray-300 text-white rounded-xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Забронировать
        </button>
      )}
    </div>
  )
}
