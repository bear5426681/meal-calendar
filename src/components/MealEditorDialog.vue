<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="width: 100%; max-width: 400px">
      <q-card-section class="text-h6">{{ mealDate }}</q-card-section>
      <q-banner v-if="auth.isLoggedIn && !canEdit" dense class="bg-orange-2 q-mx-md q-mt-sm rounded-borders">
        您沒有編輯權限，無法儲存變更。
      </q-banner>
      <q-card-section class="q-gutter-md">
        <q-select
          v-model="form.responsibleUser"
          :options="assigneeOptions"
          label="負責人"
          emit-value
          map-options
          clearable
          :disable="!canEdit"
        />
        <q-input v-model="form.dishName" label="餐點" :disable="!canEdit" />
        <q-input v-model="form.notes" label="備註" type="textarea" autogrow :disable="!canEdit" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="取消" v-close-popup />
        <q-btn
          v-if="canEdit"
          color="teal-7"
          unelevated
          label="儲存"
          :loading="saving"
          @click="save"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'
import { useMembersStore } from 'stores/members'
import { useMealsStore } from 'stores/meals'

const props = defineProps({
  modelValue: Boolean,
  mealDate: { type: String, default: null },
  meal: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const auth = useAuthStore()
const members = useMembersStore()
const meals = useMealsStore()
const $q = useQuasar()

const saving = ref(false)
const form = ref({
  responsibleUser: null,
  dishName: '',
  notes: ''
})

const canEdit = computed(() => auth.canEdit)

const assigneeOptions = computed(() =>
  members.allMembers().map((m) => ({
    label: m.auth_user_id ? m.show_name : `${m.show_name}（尚未綁定登入）`,
    value: m.user_id,
    chipColor: m.chip_color || '#26a69a'
  }))
)

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    form.value = {
      responsibleUser: props.meal?.responsible_user || null,
      dishName: props.meal?.dish_name || '',
      notes: props.meal?.notes || ''
    }
  }
)

async function save () {
  saving.value = true
  try {
    await meals.upsertMeal({
      mealDate: props.mealDate,
      responsibleUser: form.value.responsibleUser,
      dishName: form.value.dishName,
      notes: form.value.notes,
      reason: '編輯儲存'
    })
    $q.notify({ type: 'positive', message: '已儲存' })
    emit('saved')
    emit('update:modelValue', false)
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message || '儲存失敗' })
  } finally {
    saving.value = false
  }
}
</script>
