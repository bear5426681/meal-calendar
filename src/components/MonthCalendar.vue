<template>
  <div class="calendar">
    <div
      class="calendar-week calendar-week--header text-caption text-grey-7 q-mb-xs"
      :style="gridStyle"
    >
      <div
        v-for="colIdx in 7"
        :key="'hdr-' + colIdx"
        class="calendar-week__day calendar-week__day--header"
        :class="{ 'day-label-weekend': headerMeta(colIdx - 1).isWeekend }"
      >
        {{ weekLabels[colIdx - 1] }}
      </div>
    </div>
    <div
      v-for="(week, wi) in weeks"
      :key="wi"
      class="calendar-week"
      :style="gridStyle"
    >
      <div
        v-for="(day, colIdx) in week"
        :key="day.format('YYYY-MM-DD')"
        class="calendar-week__day"
        :class="colClass(colIdx, true, day)"
      >
        <DayCell
          v-if="isCurrentMonth(day, year, month)"
          :date="day"
          :meal="mealFor(day)"
          :day-meta="meta(day)"
          :assignee-name="assigneeName(day)"
          :chip-color="chipColorFor(day)"
          :is-today="isToday(day)"
          :is-selected="selectedDate === toIsoDate(day)"
          :is-drop-target="!!dragSource && dragSource !== toIsoDate(day)"
          :can-edit="canEdit"
          @click="$emit('open-day', day)"
          @start-drag="$emit('start-drag', toIsoDate(day))"
          @drop="$emit('drop-day', day)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, toRef } from 'vue'
import { calendarWeeks, toIsoDate, dayjs } from 'src/utils/dates'
import { getDayMeta, isCurrentMonth } from 'src/composables/useCalendarLayout'
import { useColumnLayout } from 'src/composables/useColumnLayout'
import { useMealsStore } from 'stores/meals'
import { useMembersStore } from 'stores/members'
import { useAuthStore } from 'stores/auth'
import DayCell from 'components/DayCell.vue'

const props = defineProps({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  holidays: { type: Array, default: () => [] },
  dragSource: { type: String, default: null },
  selectedDate: { type: String, default: null }
})

defineEmits(['open-day', 'drop-day', 'start-drag', 'cancel-drag'])

const meals = useMealsStore()
const members = useMembersStore()
const auth = useAuthStore()

const weekLabels = ['一', '二', '三', '四', '五', '六', '日']
const weeks = computed(() => calendarWeeks(props.year, props.month))
const canEdit = computed(() => auth.canEdit)
const holidaysList = computed(() => props.holidays)
const yearRef = toRef(props, 'year')
const monthRef = toRef(props, 'month')

function mealFor (day) {
  return meals.mealForDate(day)
}

const { gridStyle, colClass } = useColumnLayout(
  weeks,
  yearRef,
  monthRef,
  holidaysList,
  mealFor
)

function headerMeta (colIdx) {
  for (const week of weeks.value) {
    const d = week[colIdx]
    if (d && isCurrentMonth(d, props.year, props.month)) {
      return getDayMeta(d, props.holidays)
    }
  }
  const fallback = weeks.value[0]?.[colIdx]
  return fallback ? getDayMeta(fallback, props.holidays) : { isWeekend: false }
}

function meta (day) {
  return getDayMeta(day, props.holidays)
}

function assigneeName (day) {
  const m = mealFor(day)
  return members.nameForResponsible(m?.responsible_user)
}

function chipColorFor (day) {
  const m = mealFor(day)
  return members.chipColorForResponsible(m?.responsible_user)
}

function isToday (day) {
  return day.isSame(dayjs(), 'day')
}
</script>
