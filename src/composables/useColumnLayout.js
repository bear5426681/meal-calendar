import { computed, unref } from 'vue'
import { isWideDay, isCurrentMonth } from 'src/composables/useCalendarLayout'

const NARROW = '1fr'
const WIDE = '2.35fr'

/** 整月 7 欄共用 grid-template-columns，每列（含首末週）垂直對齊 */
export function useColumnLayout (weeks, yearSource, monthSource, holidaysSource, mealFor) {
  const columnWide = computed(() => {
    const year = unref(yearSource)
    const month = unref(monthSource)
    const holidays = unref(holidaysSource)
    const wide = [false, false, false, false, false, false, false]
    for (const week of weeks.value) {
      for (let colIdx = 0; colIdx < 7; colIdx++) {
        const d = week[colIdx]
        if (!d || !isCurrentMonth(d, year, month)) continue
        if (isWideDay(d, mealFor(d), holidays)) wide[colIdx] = true
      }
    }
    return wide
  })

  const gridStyle = computed(() => ({
    gridTemplateColumns: columnWide.value.map((w) => (w ? WIDE : NARROW)).join(' ')
  }))

  function colClass (colIdx, padWhenOutside, day) {
    const year = unref(yearSource)
    const month = unref(monthSource)
    return {
      'calendar-week__day--pad': padWhenOutside && day && !isCurrentMonth(day, year, month)
    }
  }

  return { columnWide, gridStyle, colClass }
}
