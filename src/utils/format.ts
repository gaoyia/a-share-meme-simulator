export const fmt = (n: number, digits = 2): string =>
  n.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export const fmtPct = (n: number, digits = 2): string =>
  `${n >= 0 ? '+' : ''}${n.toFixed(digits)}%`

export const fmtCompact = (n: number): string => {
  if (Math.abs(n) >= 1e8) return `${(n / 1e8).toFixed(2)}亿`
  if (Math.abs(n) >= 1e4) return `${(n / 1e4).toFixed(2)}万`
  return n.toFixed(2)
}

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v))

export function randn(): number {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export const rand = (min: number, max: number): number =>
  min + Math.random() * (max - min)

export const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]

let seq = 0
export const uid = (): number => ++seq

export function dateFromDay(day: number): string {
  const start = new Date(2126, 10, 23)
  const d = new Date(start.getTime() + day * 86400000)
  const w = d.getDay()
  if (w === 0) d.setDate(d.getDate() - 2)
  if (w === 6) d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function nowTime(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export const COMMISSION_RATE = 0.00025
export const COMMISSION_MIN = 5
export const STAMP_RATE = 0.001

export function buyFee(amount: number): number {
  return Math.max(COMMISSION_MIN, amount * COMMISSION_RATE)
}

export function sellFee(amount: number): number {
  return Math.max(COMMISSION_MIN, amount * COMMISSION_RATE) + amount * STAMP_RATE
}

export function loadSave<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function persist(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable
  }
}
