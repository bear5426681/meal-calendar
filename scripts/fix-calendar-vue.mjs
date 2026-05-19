import fs from 'fs'

const script = `import { computed } from 'vue'
import { calendarWeeks, toIsoDate } from 'src/utils/dates'
import { isWideDay, getDayMeta, isCurrentMonth } from 'src/composables/useCalendarLayout'
import { useMealsStore } from 'stores/meals'
import { useMembersStore } from 'stores/members'
import { useAuthStore } from 'stores/auth'
import DayCell from 'components/DayCell.vue'

const props = defineProps({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  holidays: { type: Array, default: () => [] },
  dragSource: { type: String, default: null }
})

defineEmits(['open-day', 'drop-day', 'start-drag', 'cancel-drag'])

const meals = useMealsStore()
const members = useMembersStore()
const auth = useAuthStore()

const weekLabels = ['一', '二', '三', '四', '五', '六', '日']
const weeks = computed(() => calendarWeeks(props.year, props.month))
const canEdit = computed(() => auth.canEdit)

function mealFor (day) {
  return meals.mealForDate(day)
}

function wide (day) {
  return isWideDay(day, mealFor(day), props.holidays)
}

function meta (day) {
  return getDayMeta(day, props.holidays)
}

function assigneeName (day) {
  const m = mealFor(day)
  return members.nameForAuthId(m?.responsible_user)
}
`

const el = 'div'
const open = (cls) => `<${el}${cls ? ` class="${cls}"` : ''}>`
const close = `</${el}>`

const template = `<template>
  ${open('calendar')}
    ${open('calendar-week calendar-week--header text-caption text-grey-7 q-mb-xs')}
      <${el} v-for="w in weekLabels" :key="w" class="calendar-week__day calendar-week__day--header">{{ w }}${close}
    ${close}
    <${el} v-for="(week, wi) in weeks" :key="wi" class="calendar-week">
      <${el}
        v-for="day in week"
        :key="day.format('YYYY-MM-DD')"
        class="calendar-week__day"
        :class="{
          'calendar-week__day--wide': isCurrentMonth(day, year, month) && wide(day),
          'calendar-week__day--pad': !isCurrentMonth(day, year, month)
        }"
      >
        <DayCell
          v-if="isCurrentMonth(day, year, month)"
          :date="day"
          :meal="mealFor(day)"
          :day-meta="meta(day)"
          :assignee-name="assigneeName(day)"
          :is-drop-target="!!dragSource && dragSource !== toIsoDate(day)"
          :can-edit="canEdit"
          @click="$emit('open-day', day)"
          @start-drag="$emit('start-drag', toIsoDate(day))"
          @drop="$emit('drop-day', day)"
        />
      ${close}
    ${close}
  ${close}
</template>

<script setup>
${script}
</script>
`

fs.writeFileSync('src/components/MonthCalendar.vue', template)
console.log('written')
