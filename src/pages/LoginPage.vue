<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card class="q-pa-lg" style="width: 100%; max-width: 360px">
      <q-card-section class="text-h6 text-center">伙食責任表</q-card-section>
      <q-card-section class="text-caption text-grey-7 text-center">
        使用 Google 帳號登入。登入後需由管理員在資料庫綁定權限方可編輯。
      </q-card-section>
      <q-card-actions vertical>
        <q-btn
          color="teal-7"
          unelevated
          icon="login"
          label="Google 登入"
          :loading="busy"
          @click="login"
        />
        <q-btn flat label="返回月曆" :to="{ name: 'home' }" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'

const auth = useAuthStore()
const router = useRouter()
const $q = useQuasar()
const busy = ref(false)

async function login () {
  busy.value = true
  try {
    await auth.signInWithGoogle()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message || '登入失敗' })
  } finally {
    busy.value = false
  }
}

if (auth.isLoggedIn) router.replace({ name: 'home' })
</script>
