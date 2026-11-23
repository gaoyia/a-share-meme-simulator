import type { Finance, Stock } from '@/types'
import { clamp } from '@/utils/format'

export interface FinanceResult {
  profit: number
  eps: number
  fair: number
  margin: number
}

export function calcFinance(f: Finance): FinanceResult {
  const profit = f.revenue - f.cost + f.otherIncome
  const eps = profit / Math.max(f.shares, 0.01)
  return {
    profit,
    eps,
    fair: eps * f.pe,
    margin: f.revenue > 0 ? (profit / f.revenue) * 100 : 0
  }
}

export function applyFinanceImpact(stock: Stock, strength = 0.45): void {
  const { fair } = calcFinance(stock.finance)
  const gap = fair / stock.price - 1
  stock.eventBias += clamp(gap * strength, -0.12, 0.12)
}
