import type { Candle, Stock } from '@/types'
import { clamp, dateFromDay, pick, rand, randn } from '@/utils/format'

interface Seed {
  code: string
  name: string
  industry: string
  price: number
  drift: number
  vol: number
  beta: number
  revenue: number
  cost: number
  otherIncome: number
  shares: number
  pe: number
}

const SEEDS: Seed[] = [
  { code: '600519', name: '贵州茅台', industry: '白酒', price: 1520, drift: 0.0022, vol: 0.026, beta: 0.7, revenue: 1500, cost: 700, otherIncome: 0, shares: 12.6, pe: 25 },
  { code: '300750', name: '宁德时代', industry: '锂电池', price: 215, drift: 0.0032, vol: 0.048, beta: 1.3, revenue: 4000, cost: 3300, otherIncome: 50, shares: 44, pe: 13 },
  { code: '002594', name: '比亚迪', industry: '汽车', price: 268, drift: 0.0028, vol: 0.040, beta: 1.1, revenue: 7000, cost: 6100, otherIncome: 80, shares: 29, pe: 8 },
  { code: '600036', name: '招商银行', industry: '银行', price: 38, drift: 0.0018, vol: 0.022, beta: 0.6, revenue: 3400, cost: 1900, otherIncome: 0, shares: 252, pe: 6 },
  { code: '688981', name: '中芯国际', industry: '半导体', price: 92, drift: 0.0040, vol: 0.058, beta: 1.5, revenue: 600, cost: 480, otherIncome: 20, shares: 80, pe: 52 },
  { code: '300059', name: '东方财富', industry: '券商', price: 22, drift: 0.0035, vol: 0.055, beta: 1.6, revenue: 120, cost: 40, otherIncome: 5, shares: 158, pe: 40 },
  { code: '000858', name: '五粮液', industry: '白酒', price: 138, drift: 0.0022, vol: 0.030, beta: 0.8, revenue: 900, cost: 300, otherIncome: 5, shares: 38.8, pe: 9 },
  { code: '601318', name: '中国平安', industry: '保险', price: 55, drift: 0.0018, vol: 0.026, beta: 0.9, revenue: 9000, cost: 7600, otherIncome: 300, shares: 182, pe: 6 }
]

export const DIVIDEND_TRIGGER = 2.2
export const DIVIDEND_BASE_RATIO = 1.15

export function defaultBasePrice(code: string): number {
  return SEEDS.find((s) => s.code === code)?.price ?? 100
}

const CONCEPTS = ['人工智能', '低空经济', '中特估', '华为产业链', '固态电池', '算力租赁', '新质生产力', '元宇宙', '无人驾驶']

const CONCEPTS_BY_INDUSTRY: Record<string, string[]> = {
  白酒: ['消费复苏', '中特估', '国企改革', '品牌出海'],
  锂电池: ['固态电池', '储能', '新质生产力', '算力租赁'],
  汽车: ['无人驾驶', '华为产业链', '以旧换新', '新质生产力'],
  银行: ['中特估', '高股息', '数字经济', '金融科技'],
  半导体: ['国产替代', 'AI算力', '华为产业链', '新质生产力'],
  券商: ['中特估', '并购重组', '金融科技', '牛市旗手'],
  保险: ['中特估', '高股息', '养老金融', '金融科技']
}

export function pickConcept(industry: string): string {
  const pool = CONCEPTS_BY_INDUSTRY[industry] ?? CONCEPTS
  return Math.random() < 0.85 ? pick(pool) : pick(CONCEPTS)
}

function genHistory(seed: Seed): Candle[] {
  const days = 60
  let price = seed.price * rand(0.80, 0.94)
  const arr: Candle[] = []
  for (let i = 0; i < days; i++) {
    const ret = seed.drift + seed.vol * randn() * 0.8
    const open = price * (1 + randn() * 0.01)
    const close = price * (1 + ret)
    const high = Math.max(open, close) * (1 + Math.abs(randn()) * 0.02)
    const low = Math.min(open, close) * (1 - Math.abs(randn()) * 0.02)
    arr.push({
      date: dateFromDay(i - days),
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume: Math.round(rand(30, 180))
    })
    price = close
  }
  const scale = seed.price / price
  return arr.map((c) => ({
    ...c,
    open: +(c.open * scale).toFixed(2),
    high: +(c.high * scale).toFixed(2),
    low: +(c.low * scale).toFixed(2),
    close: +(c.close * scale).toFixed(2)
  }))
}

export function createStocks(): Stock[] {
  return SEEDS.map((seed) => {
    const candles = genHistory(seed)
    return {
      code: seed.code,
      name: seed.name,
      industry: seed.industry,
      concept: pickConcept(seed.industry),
      price: seed.price,
      prevClose: candles[candles.length - 2].close,
      anchor: seed.price,
      drift: seed.drift,
      vol: seed.vol,
      beta: seed.beta,
      eventBias: 0,
      limitUp: +(seed.price * 1.1).toFixed(2),
      limitDown: +(seed.price * 0.9).toFixed(2),
      candles,
      finance: {
        revenue: seed.revenue,
        cost: seed.cost,
        otherIncome: seed.otherIncome,
        shares: seed.shares,
        pe: seed.pe
      },
      controller: '无明确主力',
      manipulation: 0,
      memeTag: '',
      dividends: 0,
      basePrice: seed.price
    }
  })
}

export interface MarketStep {
  index: number
  sentiment: number
  limitUpCount: number
  limitDownCount: number
}

export function stepMarket(stocks: Stock[], day: number, index: number, trend: number): MarketStep {
  const shock = randn() * 0.018
  let up = 0
  let down = 0

  for (const s of stocks) {
    const prev = s.price
    const revert = (s.anchor / prev - 1) * 0.006
    const raw = s.drift + s.beta * (shock + trend) + s.vol * randn() + revert + s.eventBias + s.manipulation * 0.012
    const bullFloor = s.eventBias < -0.012 ? raw : Math.max(raw, -0.006)
    const ret = clamp(bullFloor, -0.099, 0.099)
    const open = clamp(prev * (1 + randn() * 0.012), +(prev * 0.9).toFixed(2), +(prev * 1.1).toFixed(2))
    const close = clamp(prev * (1 + ret), +(prev * 0.9).toFixed(2), +(prev * 1.1).toFixed(2))
    const high = clamp(Math.max(open, close) * (1 + Math.abs(randn()) * 0.025), +(prev * 0.9).toFixed(2), +(prev * 1.1).toFixed(2))
    const low = clamp(Math.min(open, close) * (1 - Math.abs(randn()) * 0.025), +(prev * 0.9).toFixed(2), +(prev * 1.1).toFixed(2))

    s.candles.push({
      date: dateFromDay(day),
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume: Math.round(rand(30, 200) * (1 + Math.abs(ret) * 18))
    })
    if (s.candles.length > 120) s.candles.shift()

    s.prevClose = prev
    s.price = +close.toFixed(2)
    s.limitUp = +(prev * 1.1).toFixed(2)
    s.limitDown = +(prev * 0.9).toFixed(2)
    s.eventBias *= 0.5
    s.manipulation *= 0.55
    s.memeTag = ''
    if (close >= prev * 1.098) up++
    if (close <= prev * 0.902) down++
  }

  const indexRet = 0.0025 + trend * 0.6 + randn() * 0.012
  const newIndex = +(index * (1 + indexRet)).toFixed(2)
  const sentiment = clamp(0.5 + (up - down) * 0.08 + indexRet * 20, 0.05, 0.95)
  return { index: newIndex, sentiment, limitUpCount: up, limitDownCount: down }
}

export function applyDividend(stock: Stock, target: number): number {
  const factor = stock.price / target
  stock.candles.forEach((c) => {
    c.open = +(c.open / factor).toFixed(2)
    c.high = +(c.high / factor).toFixed(2)
    c.low = +(c.low / factor).toFixed(2)
    c.close = +(c.close / factor).toFixed(2)
  })
  stock.price = target
  stock.prevClose = +(stock.prevClose / factor).toFixed(2)
  stock.anchor = target
  stock.limitUp = +(stock.prevClose * 1.1).toFixed(2)
  stock.limitDown = +(stock.prevClose * 0.9).toFixed(2)
  stock.eventBias = 0
  stock.dividends += 1
  stock.memeTag = '除权'
  return factor
}

export { CONCEPTS }
