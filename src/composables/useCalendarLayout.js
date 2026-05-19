import { formatDateKey } from 'src/utils/dates'

/** 欄位加寬（週末、國定假日、已有資料） */
export function isWideDay (date, meal, holidayList) {
  const dow = date.day()
  if (dow === 0 || dow === 6) return true
  if (meal && (meal.responsible_user || meal.dish_name || meal.notes)) return true
  const key = formatDateKey(date)
  return holidayList.some((h) => h.date === key && h.isHoliday)
}

export function getDayMeta (date, holidayList) {
  const key = formatDateKey(date)
  const entry = holidayList.find((h) => h.date === key) || null
  const dow = date.day()
  const isWeekend = dow === 0 || dow === 6
  const isHoliday = isWeekend || !!(entry && entry.isHoliday)
  const description = (entry?.description || '').trim()

  return { entry, isWeekend, isHoliday, description }
}

export function isCurrentMonth (date, year, month) {
  return date.month() === month - 1 && date.year() === year
}
