import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from 'boot/supabase'
import { MEAL_TYPE, monthRange, yearRange, toIsoDate } from 'src/utils/dates'

export const useMealsStore = defineStore('meals', () => {
  const mealsByDate = ref({})
  const yearMeals = ref([])
  const logs = ref([])
  const loading = ref(false)

  function mapMeals (rows) {
    const map = {}
    for (const row of rows || []) {
      map[row.meal_date] = row
    }
    mealsByDate.value = map
  }

  async function fetchMonth (year, month) {
    loading.value = true
    try {
      const { start, end } = monthRange(year, month)
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('meal_type', MEAL_TYPE)
        .gte('meal_date', start)
        .lte('meal_date', end)
      if (error) throw error
      mapMeals(data)
      return data
    } finally {
      loading.value = false
    }
  }

  async function fetchYearStats (year) {
    const { start, end } = yearRange(year)
    const { data, error } = await supabase
      .from('meals')
      .select('meal_date, responsible_user')
      .eq('meal_type', MEAL_TYPE)
      .gte('meal_date', start)
      .lte('meal_date', end)
      .not('responsible_user', 'is', null)
    if (error) throw error
    yearMeals.value = data || []
  }

  const monthStats = computed(() => countByUser(Object.values(mealsByDate.value)))
  const yearStats = computed(() => countByUser(yearMeals.value))

  function countByUser (rows) {
    const counts = {}
    for (const row of rows) {
      if (!row.responsible_user) continue
      counts[row.responsible_user] = (counts[row.responsible_user] || 0) + 1
    }
    return counts
  }

  function mealForDate (date) {
    return mealsByDate.value[toIsoDate(date)] || null
  }

  async function upsertMeal ({ mealDate, responsibleUser, dishName, notes, reason }) {
    const { data, error } = await supabase.rpc('upsert_meal', {
      p_meal_date: mealDate,
      p_responsible_user: responsibleUser || null,
      p_dish_name: dishName || null,
      p_notes: notes || null,
      p_reason: reason || null
    })
    if (error) throw error
    return data
  }

  async function swapAssignees (dateA, dateB, reason) {
    const { error } = await supabase.rpc('swap_meal_assignees', {
      p_date_a: dateA,
      p_date_b: dateB,
      p_reason: reason || '拖曳互換'
    })
    if (error) throw error
  }

  async function moveAssignee (fromDate, toDate, reason) {
    const { error } = await supabase.rpc('move_meal_assignee', {
      p_from_date: fromDate,
      p_to_date: toDate,
      p_reason: reason || '拖曳移動'
    })
    if (error) throw error
  }

  async function fetchLogs (limit = 50) {
    const { data, error } = await supabase
      .from('meal_logs')
      .select('*, meals(meal_date)')
      .order('changed_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    logs.value = data || []
  }

  return {
    mealsByDate,
    yearMeals,
    logs,
    loading,
    monthStats,
    yearStats,
    fetchMonth,
    fetchYearStats,
    mealForDate,
    upsertMeal,
    swapAssignees,
    moveAssignee,
    fetchLogs
  }
})
