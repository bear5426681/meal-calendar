import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from 'boot/supabase'
import { handleOAuthRedirect } from 'src/utils/authRedirect'
import { getOAuthRedirectUrl, fixProductionRedirectLeak } from 'src/utils/appBase'

let authListenerRegistered = false

export const useAuthStore = defineStore('auth', () => {
  const session = ref(null)
  const canEdit = ref(false)
  const loading = ref(true)

  const user = computed(() => session.value?.user ?? null)
  const isLoggedIn = computed(() => !!session.value)

  const displayName = computed(() => {
    const u = user.value
    if (!u) return ''
    const meta = u.user_metadata || {}
    return meta.full_name || meta.name || u.email?.split('@')[0] || '使用者'
  })

  async function refreshAllowed () {
    if (!user.value) {
      canEdit.value = false
      return
    }
    const { data, error } = await supabase
      .from('allowed_users')
      .select('user_id')
      .eq('auth_user_id', user.value.id)
      .maybeSingle()
    if (error) {
      console.error(error)
      canEdit.value = false
      return
    }
    canEdit.value = !!data
  }

  async function init () {
    loading.value = true
    try {
      await handleOAuthRedirect()
      const { data } = await supabase.auth.getSession()
      session.value = data.session
      await refreshAllowed()

      if (!authListenerRegistered) {
        authListenerRegistered = true
        supabase.auth.onAuthStateChange(async (_event, s) => {
          session.value = s
          await refreshAllowed()
          if (_event === 'SIGNED_IN') {
            fixProductionRedirectLeak()
          }
        })
      }
      fixProductionRedirectLeak()
    } finally {
      loading.value = false
    }
  }

  async function signInWithGoogle () {
    const redirectTo = getOAuthRedirectUrl()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    })
    if (error) throw error
  }

  async function signOut () {
    await supabase.auth.signOut()
    session.value = null
    canEdit.value = false
  }

  return {
    session,
    user,
    isLoggedIn,
    canEdit,
    displayName,
    loading,
    init,
    refreshAllowed,
    signInWithGoogle,
    signOut
  }
})
