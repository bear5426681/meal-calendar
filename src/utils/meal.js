/** 當日是否有伙食相關內容（負責人、餐點、備註任一） */
export function mealHasContent (meal) {
  if (!meal) return false
  if (meal.responsible_user) return true
  if (meal.dish_name && String(meal.dish_name).trim()) return true
  if (meal.notes && String(meal.notes).trim()) return true
  return false
}
