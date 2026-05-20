<template>
  <q-page class="meal-page q-pa-sm">
    <div v-if="auth.loading" class="flex flex-center q-pa-xl">
      <q-spinner color="teal" size="40px" />
    </div>

    <template v-else>
      <q-banner v-if="auth.isLoggedIn && !auth.canEdit" dense class="bg-orange-2 q-mb-sm rounded-borders">
        已登入（{{ auth.displayName }}），但尚無編輯權限。請在 Supabase 的 allowed_users 將您的 auth_user_id 綁定到對應成員。
      </q-banner>

      <q-banner v-if="dragSource" dense class="bg-teal-1 q-mb-sm rounded-borders">
        拖曳中：點選目標日期以放置（{{ dragSource }}）
        <template #action>
          <q-btn flat dense label="取消" @click="dragSource = null" />
        </template>
      </q-banner>

      <StatsPanel
        :year="viewYear"
        :month="viewMonth"
        class="q-mb-sm"
      />

      <div class="row items-center q-mb-sm q-gutter-xs">
        <q-btn flat round dense icon="chevron_left" @click="prevMonth" />
        <div class="col text-center text-subtitle1 text-weight-medium">
          {{ viewYear }} 年 {{ viewMonth }} 月
        </div>
        <q-btn flat round dense icon="chevron_right" @click="nextMonth" />
        <q-space />
        <q-btn flat dense icon="history" label="紀錄" @click="showLogs = true" />
      </div>

      <MonthCalendar
        :key="`${viewYear}-${viewMonth}`"
        :year="viewYear"
        :month="viewMonth"
        :holidays="holidays"
        :drag-source="dragSource"
        :selected-date="selectedDate"
        @open-day="onDayClick"
        @drop-day="onDropDay"
        @start-drag="dragSource = $event"
        @cancel-drag="dragSource = null"
      />

      <DayDetailPanel
        ref="detailPanelRef"
        :meal-date="selectedDate"
        :holidays="holidays"
        @edit="openEditorFromDetail"
        @close="selectedDate = null"
      />

      <MealEditorDialog
        v-model="editorOpen"
        :meal-date="editorDate"
        :meal="editorMeal"
        @saved="reload"
      />

      <LogDrawer v-model="showLogs" />
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { dayjs, toIsoDate } from 'src/utils/dates'
import { useAuthStore } from 'stores/auth'
import { useMealsStore } from 'stores/meals'
import { useMembersStore } from 'stores/members'
import { mealHasContent } from 'src/utils/meal'
import MonthCalendar from 'components/MonthCalendar.vue'
import DayDetailPanel from 'components/DayDetailPanel.vue'
import MealEditorDialog from 'components/MealEditorDialog.vue'
import StatsPanel from 'components/StatsPanel.vue'
import LogDrawer from 'components/LogDrawer.vue'
import holidays2026 from 'assets/holidays/2026.json'

const auth = useAuthStore()
const meals = useMealsStore()
const members = useMembersStore()
const $q = useQuasar()

const viewYear = ref(dayjs().year())
const viewMonth = ref(dayjs().month() + 1)
const editorOpen = ref(false)
const editorDate = ref(null)
const selectedDate = ref(null)
const detailPanelRef = ref(null)
const showLogs = ref(false)
const dragSource = ref(null)

const holidays = computed(() => {
  if (viewYear.value === 2026) return holidays2026
  return []
})

const editorMeal = computed(() =>
  editorDate.value ? meals.mealForDate(dayjs(editorDate.value)) : null
)

async function reload () {
  await meals.fetchMonth(viewYear.value, viewMonth.value)
  await meals.fetchYearStats(viewYear.value)
  dragSource.value = null
  if (selectedDate.value && !mealHasContent(meals.mealForDate(dayjs(selectedDate.value)))) {
    selectedDate.value = null
  }
}

function prevMonth () {
  const d = dayjs().year(viewYear.value).month(viewMonth.value - 1).subtract(1, 'month')
  viewYear.value = d.year()
  viewMonth.value = d.month() + 1
}

function nextMonth () {
  const d = dayjs().year(viewYear.value).month(viewMonth.value - 1).add(1, 'month')
  viewYear.value = d.year()
  viewMonth.value = d.month() + 1
}

async function scrollToDetail () {
  await nextTick()
  detailPanelRef.value?.$el?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })
}

function onDayClick (date) {
  const iso = toIsoDate(date)
  const meal = meals.mealForDate(date)
  if (mealHasContent(meal)) {
    selectedDate.value = iso
    editorOpen.value = false
    scrollToDetail()
    return
  }
  selectedDate.value = null
  editorDate.value = iso
  editorOpen.value = true
}

function openEditorFromDetail () {
  if (!selectedDate.value) return
  editorDate.value = selectedDate.value
  editorOpen.value = true
}

async function onDropDay (targetDate) {
  if (!auth.canEdit || !dragSource.value) return
  const from = dragSource.value
  const to = toIsoDate(targetDate)
  if (from === to) {
    dragSource.value = null
    return
  }
  const targetMeal = meals.mealForDate(targetDate)
  try {
    if (targetMeal?.responsible_user) {
      await meals.swapAssignees(from, to)
    } else {
      await meals.moveAssignee(from, to)
    }
    $q.notify({ type: 'positive', message: '已更新排班' })
    await reload()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message || '操作失敗' })
  }
}

watch([viewYear, viewMonth], async () => {
  selectedDate.value = null
  try {
    await reload()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message || '載入月曆失敗' })
  }
})

onMounted(async () => {
  try {
    await members.fetchMembers()
    await reload()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  }
})
</script>
