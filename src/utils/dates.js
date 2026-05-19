import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import 'dayjs/locale/zh-tw'

dayjs.extend(isoWeek)
dayjs.locale('zh-tw')

export const MEAL_TYPE = 'lunch'

export function formatDateKey (d) {
  return dayjs(d).format('YYYYMMDD')
}

export function toIsoDate (d) {
  return dayjs(d).format('YYYY-MM-DD')
}

export function monthRange (year, month) {
  const start = dayjs().year(year).month(month - 1).startOf('month')
  const end = start.endOf('month')
  return { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') }
}

export function yearRange (year) {
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`
  }
}

export function calendarWeeks (year, month) {
  const first = dayjs().year(year).month(month - 1).date(1)
  const start = first.startOf('isoWeek')
  const last = first.endOf('month')
  const end = last.endOf('isoWeek')
  const weeks = []
  let cursor = start
  while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
    const week = []
    for (let i = 0; i < 7; i++) {
      week.push(cursor.add(i, 'day'))
    }
    weeks.push(week)
    cursor = cursor.add(7, 'day')
  }
  return weeks
}

export { dayjs }
