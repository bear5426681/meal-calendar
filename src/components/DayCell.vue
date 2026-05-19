<template>
  <div
    class="day-cell"
    :class="{
      'day-cell--today': isToday,
      'day-cell--drop-target': isDropTarget
    }"
    @click.stop="onCellClick"
  >
    <div
      class="day-header"
      :class="{
        'day-header--weekend': dayMeta.isWeekend,
        'day-header--holiday': dayMeta.isHoliday,
        'day-header--today': isToday
      }"
    >
      <span class="day-num">{{ date.date() }}</span>
      <span v-if="dayMeta.description" class="day-desc">{{ dayMeta.description }}</span>
    </div>
    <div class="day-body">
      <div v-if="assigneeName" class="day-body__row">
        <span
          class="assignee-chip"
          :class="{ 'assignee-chip--dragging': dragging }"
          :style="chipStyle"
          @touchstart.passive="onTouchStart"
          @touchend.prevent="onTouchEnd"
          @mousedown.prevent="onMouseDown"
        >{{ assigneeName }}</span>
      </div>
      <div v-if="meal?.dish_name" class="meal-line">{{ meal.dish_name }}</div>
      <div v-if="meal?.notes" class="meal-line meal-line--muted">{{ meal.notes }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { textColorOnBackground } from 'src/utils/color'

const props = defineProps({
  date: { type: Object, required: true },
  meal: { type: Object, default: null },
  dayMeta: {
    type: Object,
    default: () => ({ isWeekend: false, isHoliday: false, description: '' })
  },
  assigneeName: { type: String, default: '' },
  chipColor: { type: String, default: '#26a69a' },
  isToday: { type: Boolean, default: false },
  isDropTarget: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false }
})

const emit = defineEmits(['click', 'start-drag', 'drop'])

const dragging = ref(false)
let longPressTimer = null
let longPressTriggered = false

const chipStyle = computed(() => {
  const bg = props.chipColor || '#26a69a'
  return {
    backgroundColor: bg,
    color: textColorOnBackground(bg)
  }
})

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
