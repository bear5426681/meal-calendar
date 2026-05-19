<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-teal-7">
      <q-toolbar>
        <q-toolbar-title>吃🐻🌳🐻🌳🐻飯</q-toolbar-title>
        <q-space />
        <span v-if="auth.isLoggedIn" class="user-label q-mr-xs">{{ auth.displayName }}</span>
        <q-btn
          v-if="auth.isLoggedIn"
          flat
          dense
          icon="logout"
          aria-label="登出"
          @click="onLogout"
        />
        <q-btn
          v-else
          flat
          dense
          label="登入"
          :to="{ name: 'login' }"
        />
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'

const auth = useAuthStore()
const router = useRouter()
const $q = useQuasar()

onMounted(() => {
  auth.init()
})

async function onLogout () {
  await auth.signOut()
  $q.notify({ type: 'info', message: '已登出' })
  router.push({ name: 'login' })
}
</script>

<style scoped>
.user-label {
  font-size: 13px;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
