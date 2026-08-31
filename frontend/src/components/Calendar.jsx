import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import {
  MONTH_NAMES_RU,
  WEEKDAY_NAMES_RU,
  buildMonthGrid,
  isSameDay,
  todayDate,
  toDateStr,
} from '../dateUtils.js'

/**
 * Полностью кликабельный календарь: выбор даты без ручного ввода текста.
 * selectedDate / today — объекты Date. onSelect(dateStr) вызывается с YYYY-MM-DD.
 */
export default function Calendar({ selectedDateStr, onSelect, maxMonthsAhead = 3 }) {
  const today = todayDate()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const cells = buildMonthGrid(viewYear, viewMonth)

  const minMonthIndex = today.getFullYear() * 12 + today.getMonth()
  const maxMonthIndex = minMonthIndex + maxMonthsAhead
  const currentMonthIndex = viewYear * 12 + viewMonth

  function goPrevMonth() {
    if (currentMonthIndex <= minMonthIndex) return
    const m = viewMonth === 0 ? 11 : viewMonth - 1
    const y = viewMonth === 0 ? viewYear - 1 : viewYear
    setViewMonth(m)
    setViewYear(y)
  }

  function goNextMonth() {
    if (currentMonthIndex >= maxMonthIndex) return
    const m = viewMonth === 11 ? 0 : viewMonth + 1
    const y = viewMonth === 11 ? viewYear + 1 : viewYear
    setViewMonth(m)
    setViewYear(y)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goPrevMonth}
          disabled={currentMonthIndex <= minMonthIndex}
          className="p-1.5 rounded-lg text-gray-500 disabled:text-gray-200 hover:bg-gray-50 disabled:hover:bg-transparent"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-sm font-semibold text-gray-900">
          {MONTH_NAMES_RU[viewMonth]} {viewYear}
        </div>
        <button
          type="button"
          onClick={goNextMonth}
          disabled={currentMonthIndex >= maxMonthIndex}
          className="p-1.5 rounded-lg text-gray-500 disabled:text-gray-200 hover:bg-gray-50 disabled:hover:bg-transparent"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_NAMES_RU.map((w) => (
          <div key={w} className="text-center text-[11px] font-medium text-gray-400 py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cellDate, i) => {
          if (!cellDate) return <div key={i} />

          const isPast = cellDate < today
          const isToday = isSameDay(cellDate, today)
          const dateStr = toDateStr(cellDate)
          const isSelected = selectedDateStr === dateStr

          return (
            <button
              key={i}
              type="button"
              disabled={isPast}
              onClick={() => onSelect(dateStr)}
              className={`aspect-square rounded-lg text-sm font-medium transition flex items-center justify-center ${
                isPast
                  ? 'text-gray-200 cursor-not-allowed'
                  : isSelected
                  ? 'bg-indigo-600 text-white'
                  : isToday
                  ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cellDate.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
