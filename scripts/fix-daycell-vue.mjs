import fs from 'fs'

const el = 'motion.div'.replace('motion.', '')

const template = `<template>
  <${el}
    class="day-cell"
    :class="{ 'day-cell--drop-target': isDropTarget }"
    @click.stop="onCellClick"
  >
    <${el}
      class="day-header"
      :class="{
        'day-header--weekend': dayMeta.isWeekend,
        'day-header--holiday': dayMeta.isHoliday
      }"
    >
      <span class="day-num">{{ date.date() }}</span>
      <span v-if="dayMeta.description" class="day-desc">{{ dayMeta.description }}</span>
    </${el}>
    <${el} class="day-body">
      <${el} v-if="assigneeName" class="day-body__row">
        <span
          class="assignee-chip"
          :class="{ 'assignee-chip--dragging': dragging }"
          @touchstart.passive="onTouchStart"
          @touchend.prevent="onTouchEnd"
          @mousedown.prevent="onMouseDown"
        >{{ assigneeName }}</span>
      </${el}>
      <${el} v-if="meal?.dish_name" class="meal-line">{{ meal.dish_name }}</${el}>
      <${el} v-if="meal?.notes" class="meal-line meal-line--muted">{{ meal.notes }}</${el}>
    </${el}>
  </${el}>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  date: { type: Object, required: true },
  meal: { type: Object, default: null },
  dayMeta: {
    type: Object,
    default: () => ({ isWeekend: false, isHoliday: false, description: '' })
  },
  assigneeName: { type: String, default: '' },
  isDropTarget: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false }
})

const emit = defineEmits(['click', 'start-drag', 'drop'])

const dragging = ref(false)
let longPressTimer = null
let longPressTriggered = false

function onCellClick () {
  if (longPressTriggered) {
    longPressTriggered = false
    return
  }
  if (props.isDropTarget) {
    emit('drop')
    return
  }
  emit('click')
}

function startLongPress () {
  if (!props.canEdit || !props.assigneeName) return
  clearTimeout(longPressTimer)
  longPressTimer = setTimeout(() => {
    longPressTriggered = true
    dragging.value = true
    emit('start-drag')
  }, 450)
}

function cancelLongPress () {
  clearTimeout(longPressTimer)
}

function onTouchStart () {
  startLongPress()
}

function onTouchEnd () {
  cancelLongPress()
}

function onMouseDown () {
  startLongPress()
  const up = () => {
    cancelLongPress()
    window.removeEventListener('mouseup', up)
  }
  window.addEventListener('mouseup', up)
}
</script>
`

fs.writeFileSync('src/components/DayCell.vue', template.replaceAll('motion.div', 'div'))
console.log('DayCell ok')
