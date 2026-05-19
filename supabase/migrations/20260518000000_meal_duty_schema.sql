-- Schema snapshot (applied via Supabase MCP). Use for local reference / db pull sync.

ALTER TABLE public.meals
  ADD COLUMN IF NOT EXISTS dish_name text,
  ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE public.meal_logs
  ADD COLUMN IF NOT EXISTS change_type text,
  ADD COLUMN IF NOT EXISTS payload jsonb;

-- RPCs: is_allowed_user, assert_allowed, upsert_meal, swap_meal_assignees, move_meal_assignee, update_meal_and_log
