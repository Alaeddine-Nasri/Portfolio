// src/utils/asset.ts
const BASE = import.meta.env.BASE_URL || '/'

export function asset(path?: string) {
  if (!path) return ''
  // absolute http(s) links pass through
  if (/^https?:\/\//i.test(path)) return path
  // ensure we honor the Vite base (e.g. /Portfolio/)
  const p = path.startsWith('/') ? path.slice(1) : path
  return BASE + p
}
