<template>
  <q-dialog :model-value="modelValue" position="bottom" @update:model-value="onToggle">
    <q-card style="width: 100%; max-height: 70vh">
      <q-card-section class="row items-center">
        <div class="text-h6 col">異動紀錄</div>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>
      <q-separator />
      <q-card-section class="scroll" style="max-height: 55vh">
        <q-list v-if="logs.length" separator>
          <q-item v-for="log in logs" :key="log.id">
            <q-item-section>
              <q-item-label>
                {{ formatDate(log.meals?.meal_date) }}
                · {{ typeLabel(log.change_type) }}
              </q-item-label>
              <q-item-label caption>
                {{ formatUsers(log) }}
                <span v-if="log.reason"> — {{ log.reason }}</span>
              </q-item-label>
              <q-item-label v-if="log.payload" caption class="text-grey-6">
                {{ JSON.stringify(log.payload) }}
              </q-item-label>
            </q-item-section>
            <q-item-section side caption>{{ formatTime(log.changed_at) }}</q-item-section>
          </q-item>
        </q-list>
        <div v-else class="text-grey-6 text-center q-pa-md">尚無紀錄</div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, watch } from 'vue'
import dayjs from 'dayjs'
import { useMealsStore } from 'stores/meals'
import { useMembersStore } from 'stores/members'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const meals = useMealsStore()
const members = useMembersStore()

const logs = computed(() => meals.logs)

watch(
  () => props.modelValue,
  async (open) => {
    if (open) await meals.fetchLogs()
  }
)

function onToggle (v) {
  emit('update:modelValue', v)
}

function typeLabel (t) {
  const map = {
    assignee: '負責人',
    dish: '餐點',
    notes: '備註',
    swap: '互換',
    move: '移動',
    create: '新增'
  }
  return map[t] || t || '變更'
}

function formatDate (d) {
  return d ? dayjs(d).format('YYYY-MM-DD') : '—'
}

function formatTime (t) {
  return dayjs(t).format('MM/DD HH:mm')
}

function formatUsers (log) {
  if (log.change_type === 'swap' || log.change_type === 'move') {
    return members.nameForResponsible(log.from_user) + ' → ' + members.nameForResponsible(log.to_user)
  }
  if (log.from_user || log.to_user) {
    return (members.nameForResponsible(log.from_user) || '—') + ' → ' + (members.nameForResponsible(log.to_user) || '—')
  }
  return ''
}
</script>
