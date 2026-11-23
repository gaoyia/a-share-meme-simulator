export type Tone = 'good' | 'bad' | 'neutral' | 'meme'

export interface Candle {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Finance {
  revenue: number
  cost: number
  otherIncome: number
  shares: number
  pe: number
}

export interface Stock {
  code: string
  name: string
  industry: string
  concept: string
  price: number
  prevClose: number
  anchor: number
  drift: number
  vol: number
  beta: number
  eventBias: number
  limitUp: number
  limitDown: number
  candles: Candle[]
  finance: Finance
  controller: string
  manipulation: number
  memeTag: string
  dividends: number
  basePrice: number
}

export interface Position {
  code: string
  shares: number
  cost: number
  buyDay: number
}

export interface Trade {
  id: number
  day: number
  code: string
  name: string
  side: 'buy' | 'sell'
  price: number
  shares: number
  amount: number
  fee: number
  pnl?: number
}

export interface NewsItem {
  id: number
  day: number
  time: string
  title: string
  detail: string
  tone: Tone
  code?: string
}

export interface Rival {
  id: string
  name: string
  tag: string
  assets: number
  base: number
  strategy: string
}

export interface ActionDef {
  id: string
  name: string
  icon: string
  desc: string
  cost: number
  tone: Tone
  target: 'stock' | 'market'
  cooldown: number
}

export interface RumorState {
 stockCode: string
  power: number
  days: number
}

export interface GameSave {
  day: number
  cash: number
  coins: number
  positions: Position[]
  rivals: Rival[]
  stocks: Stock[]
  news: NewsItem[]
  trades: Trade[]
  history: { day: number; asset: number }[]
  lastTick: number
  violation: number
  gameOver: boolean
  secrets: number
  selectedCode?: string
  leverage?: number
  autoBuy?: boolean
}
