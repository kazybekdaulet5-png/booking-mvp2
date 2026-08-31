// Работаем с локальной датой пользователя, а не UTC.
// new Date().toISOString() переводит время в UTC и может "откатить" дату на
// день назад в утренние часы для часовых поясов впереди UTC (например,
// Казахстан, UTC+5) — поэтому здесь дата собирается вручную из локальных
// компонентов (getFullYear/getMonth/getDate).

export function toDateStr(d) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayStr() {
  return toDateStr(new Date())
}

export function todayDate() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function parseDateStr(s) {
  const [year, month, day] = s.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export const MONTH_NAMES_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

export const WEEKDAY_NAMES_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

/** Возвращает массив ячеек месяца (включая "хвосты" соседних месяцев для ровной сетки 6x7). */
export function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1)
  // getDay(): 0 = воскресенье ... 6 = суббота -> переводим в понедельник-первую неделю
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day))
  }
  while (cells.length % 7 !== 0) {
    cells.push(null)
  }
  return cells
}
