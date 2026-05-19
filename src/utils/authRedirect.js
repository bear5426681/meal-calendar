import { supabase } from 'boot/supabase'
import {
  getAppEntryUrl,
  getAppBasePath,
  fixProductionRedirectLeak,
  isProductionHost
} from 'src/utils/appBase'

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

  if (hash.includes('access_token')) {
    const normalized = hash.replace(/^#\/?\/?/, '')
    const qs = normalized.startsWith('access_token')
      ? normalized
      : normalized.slice(normalized.indexOf('access_token'))
    const params = new URLSearchParams(qs)
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    if (access_token && refresh_token) {
      return { type: 'tokens', access_token, refresh_token }
    }
  }

  return null
}

export function hasAuthFragmentInUrl () {
  return /access_token=|refresh_token=|code=|error=/.test(window.location.href)
}

export function cleanAuthUrl () {
  const clean = getAppEntryUrl()
  if (window.location.href !== clean) {
    window.history.replaceState(null, '', clean)
  }
}

function isWrongOAuthLanding () {
  const base = getAppBasePath()
  if (base === '/') return false
  const onSiteRoot =
    window.location.pathname === '/' || window.location.pathname === ''
  return onSiteRoot && hasAuthFragmentInUrl()
}

async function applyParsedSession (parsed) {
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
}

export async function handleOAuthRedirect () {
  if (typeof window === 'undefined') return false

  const parsed = parseTokensFromUrl()
  if (!parsed) {
    if (hasAuthFragmentInUrl()) cleanAuthUrl()
    fixProductionRedirectLeak()
    return false
  }

  try {
    await applyParsedSession(parsed)

    if (isWrongOAuthLanding()) {
      window.location.replace(getAppEntryUrl())
      return true
    }

    cleanAuthUrl()
    fixProductionRedirectLeak()
    return true
  } catch (e) {
    console.error('[auth] OAuth redirect failed', e)
    if (isWrongOAuthLanding() || isProductionHost()) {
      window.location.replace(getAppEntryUrl())
    } else {
      cleanAuthUrl()
    }
    return false
  }
}
