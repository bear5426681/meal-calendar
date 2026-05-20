<template>
  <q-card v-if="mealDate" flat bordered class="day-detail q-mt-md">
    <q-card-section class="q-pb-sm">
      <div class="row items-start no-wrap">
        <div class="col">
          <div class="text-subtitle1 text-weight-medium">{{ title }}</div>
          <div v-if="dayMeta.description" class="text-caption text-orange-9 q-mt-xs">
            {{ dayMeta.description }}
          </div>
        </div>
        <q-btn flat round dense icon="close" aria-label="關閉" @click="$emit('close')" />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="q-gutter-sm">
      <div v-if="assigneeName" class="day-detail__row">
        <span class="text-caption text-grey-7">負責人</span>
        <span class="assignee-chip assignee-chip--detail" :style="chipStyle">{{ assigneeName }}</span>
      </div>
      <div v-if="meal?.dish_name" class="day-detail__row">
        <span class="text-caption text-grey-7">餐點</span>
        <span class="day-detail__text">{{ meal.dish_name }}</span>
      </div>
      <div v-if="meal?.notes" class="day-detail__row day-detail__row--stack">
        <span class="text-caption text-grey-7">備註</span>
        <span class="day-detail__text day-detail__text--notes">{{ meal.notes }}</span>
      </div>
    </q-card-section>

    <q-card-actions v-if="canEdit" align="right" class="q-pt-none">
      <q-btn color="teal-7" unelevated label="編輯" icon="edit" @click="$emit('edit')" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { dayjs } from 'src/utils/dates'
import { getDayMeta } from 'src/composables/useCalendarLayout'
import { useMealsStore } from 'stores/meals'
import { useMembersStore } from 'stores/members'
import { useAuthStore } from 'stores/auth'
import { textColorOnBackground } from 'src/utils/color'

const props = defineProps({
  mealDate: { type: String, default: null },
  holidays: { type: Array, default: () => [] }
})

defineEmits(['edit', 'close'])

const meals = useMealsStore()
const members = useMembersStore()
const auth = useAuthStore()

const canEdit = computed(() => auth.canEdit)

const meal = computed(() =>
  props.mealDate ? meals.mealForDate(dayjs(props.mealDate)) : null
)

const title = computed(() => {
  if (!props.mealDate) return ''
  return dayjs(props.mealDate).format('YYYY年M月D日 dddd')
})

const dayMeta = computed(() =>
  props.mealDate ? getDayMeta(dayjs(props.mealDate), props.holidays) : {}
)

const assigneeName = computed(() =>
  members.nameForResponsible(meal.value?.responsible_user)
)

const chipStyle = computed(() => {
  const bg = members.chipColorForResponsible(meal.value?.responsible_user) || '#26a69a'
  return {
    backgroundColor: bg,
    color: textColorOnBackground(bg)
  }
})
</script>
