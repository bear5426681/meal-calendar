import { supabase } from 'boot/supabase'

/** 從網址任意位置擷取 OAuth token（含 /#/#access_token= 雙 hash） */
function parseTokensFromUrl () {
  const href = window.location.href
  const hash = window.location.hash || ''

  const fromSearch = new URLSearchParams(window.location.search)
  const code = fromSearch.get('code')
  if (code) return { type: 'code', code }

  const tokenMatch = href.match(/access_token=([^&]+)/)
  const refreshMatch = href.match(/refresh_token=([^&]+)/)
  if (tokenMatch && refreshMatch) {
    return {
      type: 'tokens',
      access_token: decodeURIComponent(tokenMatch[1]),
      refresh_token: decodeURIComponent(refreshMatch[1])
    }
  }

  // hash: #access_token= 或 #/#access_token= 或 #/access_token=
  if (hash.includes('access_token')) {
    const normalized = hash.replace(/^#\/?\/?/, '')
    const params = new URLSearchParams(
      normalized.startsWith('access_token') ? normalized : normalized.slice(normalized.indexOf('access_token'))
    )
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    if (access_token && refresh_token) {
      return { type: 'tokens', access_token, refresh_token }
    }
  }

  return null
}

export function cleanAuthUrl () {
  const base = `${window.location.origin}${window.location.pathname}`
  const clean = `${base.replace(/\/$/, '')}/#/`
  if (window.location.href !== clean) {
    window.history.replaceState(null, '', clean)
  }
}

export function hasAuthFragmentInUrl () {
  const h = window.location.href
  return /access_token=|refresh_token=|code=|error=/.test(h)
}

/** OAuth 回傳與 Vue hash router 衝突時，手動還原 session 並清網址 */
export async function handleOAuthRedirect () {
  if (typeof window === 'undefined') return false

  const parsed = parseTokensFromUrl()
  if (!parsed) {
    if (hasAuthFragmentInUrl()) cleanAuthUrl()
    return false
  }

  try {
    if (parsed.type === 'code') {
      const { error } = await supabase.auth.exchangeCodeForSession(parsed.code)
      if (error) throw error
    } else {
      const { error } = await supabase.auth.setSession({
        access_token: parsed.access_token,
        refresh_token: parsed.refresh_token
      })
      if (error) throw error
    }
    cleanAuthUrl()
    return true
  } catch (e) {
    console.error('[auth] OAuth redirect failed', e)
    cleanAuthUrl()
    return false
  }
}
