/**
 * 優先使用「目前網址」的 pathname，避免 build 環境變數殘留導向 localhost。
 * GitHub Pages：/meal-calendar/；本機：/
 */
export function getAppBasePath () {
  const parts = window.location.pathname.split('/').filter(Boolean)
  if (parts.length > 0 && parts[0] !== 'index.html') {
    return `/${parts[0]}/`
  }

  const fromBuild =
    import.meta.env.VITE_PUBLIC_PATH ||
    import.meta.env.BASE_URL ||
    '/'

  return fromBuild.endsWith('/') ? fromBuild : `${fromBuild}/`
}

export function getOAuthRedirectUrl () {
  return `${window.location.origin}${getAppBasePath()}`
}

export function getAppEntryUrl () {
  return `${getOAuthRedirectUrl()}#/`
}

/** 在正式站時，阻擋被導向 localhost（常來自 Supabase Site URL 設錯） */
export function isProductionHost () {
  const h = window.location.hostname
  return h.includes('github.io') || h.includes('githubusercontent.com')
}

export function fixProductionRedirectLeak () {
  if (!isProductionHost()) return
  const entry = getAppEntryUrl()
  const current = window.location.href
  if (current.includes('localhost') || current.startsWith('http://127.')) {
    window.location.replace(entry)
    return
  }
  const base = getAppBasePath()
  if (!window.location.pathname.startsWith(base.replace(/\/$/, ''))) {
    window.location.replace(entry)
  }
}
