/** 依背景色決定標籤文字顏色 */
export function textColorOnBackground (hex) {
  if (!hex || typeof hex !== 'string') return '#fff'
  const h = hex.replace('#', '')
  if (h.length !== 6) return '#fff'
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.82 ? '#212121' : '#fff'
}
