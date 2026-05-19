<template>
  <q-card flat bordered class="q-pa-sm">
    <div class="text-caption text-grey-7 q-mb-xs">負責天數統計</div>
    <div class="text-caption q-mb-xs">{{ year }} 年 {{ month }} 月</div>
    <div class="row q-gutter-xs q-mb-sm flex-wrap">
      <q-chip
        v-for="chip in monthChips"
        :key="'m-' + chip.id"
        dense
        color="teal-1"
        text-color="teal-9"
      >
        {{ chip.name }}：{{ chip.count }}
      </q-chip>
      <span v-if="!monthChips.length" class="text-grey-6 text-caption">本月尚無排班</span>
    </div>
    <div class="text-caption text-grey-7">{{ year }} 年累計</div>
    <div class="row q-gutter-xs flex-wrap">
      <q-chip
        v-for="chip in yearChips"
        :key="'y-' + chip.id"
        dense
        outline
        color="teal"
      >
        {{ chip.name }}：{{ chip.count }}
      </q-chip>
    </div>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { useMealsStore } from 'stores/meals'
import { useMembersStore } from 'stores/members'

defineProps({
  year: { type: Number, required: true },
  month: { type: Number, required: true }
})

const meals = useMealsStore()
const members = useMembersStore()

function toChips (counts) {
  return Object.entries(counts).map(([id, count]) => ({
    id,
    name: members.nameForResponsible(id),
    count
  }))
}

const monthChips = computed(() => toChips(meals.monthStats))
const yearChips = computed(() => toChips(meals.yearStats))
</script>
