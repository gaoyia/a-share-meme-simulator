import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ActionDef, GameSave, NewsItem, Position, Rival, Stock, Tone, Trade } from '@/types'
import { ACTION_DEFS, MEME_CARDS, ambientNews, goodNewsText, makeNews, rumorText, squeezeNews, type MemeCard } from '@/engine/events'
import { applyDividend, CONCEPTS, createStocks, defaultBasePrice, DIVIDEND_BASE_RATIO, DIVIDEND_TRIGGER, stepMarket } from '@/engine/market'
import { applyFinanceImpact, calcFinance } from '@/engine/finance'
import { buyFee, clamp, loadSave, nowTime, persist, pick, rand, sellFee, uid } from '@/utils/format'

const SAVE_KEY = 'ashare-meme-save-v1'
const INITIAL_CASH = 100000
const INITIAL_COINS = 20000
const DAY_MS = 250

export interface Toast {
  id: number
  text: string
  tone: Tone
}

function makeRivals(): Rival[] {
  return [
    { id: 'r1', name: '章盟主', tag: '游资', assets: INITIAL_CASH, base: INITIAL_CASH, strategy: '打板追涨，专做涨停' },
    { id: 'r2', name: '量化精灵', tag: '量化', assets: INITIAL_CASH, base: INITIAL_CASH, strategy: '高频套利，稳定吃波动' },
    { id: 'r3', name: '时间的朋友', tag: '价投', assets: INITIAL_CASH, base: INITIAL_CASH, strategy: '买入优质资产长期躺平' }
  ]
}

export const useGameStore = defineStore('game', () => {
  const day = ref(1)
  const cash = ref(INITIAL_CASH)
  const coins = ref(INITIAL_COINS)
  const positions = ref<Position[]>([])
  const stocks = ref<Stock[]>(createStocks())
  const news = ref<NewsItem[]>([])
  const trades = ref<Trade[]>([])
  const history = ref<{ day: number; asset: number }[]>([{ day: 1, asset: INITIAL_CASH }])
  const index = ref(3200)
  const trend = ref(0.0004)
  const sentiment = ref(0.5)
  const rivals = ref<Rival[]>(makeRivals())
  const running = ref(false)
  const speed = ref(1)
  const gameOver = ref(false)
  const violation = ref(0)
  const leverage = ref(1)
  const autoBuy = ref(false)
  const selectedCode = ref('300059')
  const cooldowns = ref<Record<string, number>>({})
  const toasts = ref<Toast[]>([])
  const fxSignal = ref(0)
  const fxType = ref<'buy' | 'sell' | 'dividend' | 'limitup' | ''>('')
  const lastLimitFxDay = ref(0)
  const lastTick = ref(Date.now())
  const todayCard = ref<MemeCard | null>(null)
  const lastCardDay = ref(0)
  const financeTarget = ref('')

  const selectedStock = computed(() => stocks.value.find((s) => s.code === selectedCode.value) ?? stocks.value[0])
  const positionValue = computed(() =>
    positions.value.reduce((sum, p) => {
      const s = stocks.value.find((x) => x.code === p.code)
      return sum + (s ? s.price * p.shares : 0)
    }, 0)
  )
  const totalAsset = computed(() => cash.value + positionValue.value)
  const totalReturn = computed(() => ((totalAsset.value - INITIAL_CASH) / INITIAL_CASH) * 100)
  const positionCount = computed(() => positions.value.length)
  const ranking = computed(() =>
    [
      { id: 'me', name: '你', tag: '散户', assets: totalAsset.value, base: INITIAL_CASH },
      ...rivals.value
    ]
      .map((r) => ({ ...r, ret: ((r.assets - r.base) / r.base) * 100 }))
      .sort((a, b) => b.assets - a.assets)
  )
  const myRank = computed(() => ranking.value.findIndex((r) => r.id === 'me') + 1)
  const dividendProgress = computed(() => {
    const ratio = Math.max(...stocks.value.map((s) => s.price / Math.max(s.basePrice ?? s.anchor, 0.01)))
    return clamp(((ratio - 1) / (DIVIDEND_TRIGGER - 1)) * 100, 0, 100)
  })

  function notify(text: string, tone: Tone = 'neutral'): void {
    const id = uid()
    toasts.value.push({ id, text, tone })
    window.setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, 3200)
  }

  function fireFx(type: 'buy' | 'sell' | 'dividend' | 'limitup'): void {
    fxType.value = type
    fxSignal.value += 1
  }

  function save(): void {
    const data: GameSave = {
      day: day.value,
      cash: cash.value,
      coins: coins.value,
      positions: positions.value,
      rivals: rivals.value,
      stocks: stocks.value,
      news: news.value.slice(0, 100),
      trades: trades.value.slice(0, 100),
      history: history.value,
      lastTick: lastTick.value,
      violation: violation.value,
      gameOver: gameOver.value,
      secrets: 0,
      selectedCode: selectedCode.value,
      leverage: leverage.value,
      autoBuy: autoBuy.value
    }
    persist(SAVE_KEY, data)
  }

  function reset(): void {
    day.value = 1
    cash.value = INITIAL_CASH
    coins.value = INITIAL_COINS
    positions.value = []
    stocks.value = createStocks()
    news.value = []
    trades.value = []
    history.value = [{ day: 1, asset: INITIAL_CASH }]
    index.value = 3200
    trend.value = 0.0004
    sentiment.value = 0.5
    rivals.value = makeRivals()
    running.value = false
    gameOver.value = false
    violation.value = 0
    leverage.value = 1
    autoBuy.value = false
    selectedCode.value = '300059'
    cooldowns.value = {}
    todayCard.value = null
    lastCardDay.value = 0
    financeTarget.value = ''
    lastTick.value = Date.now()
    save()
  }

  function init(): void {
    const saved = loadSave<GameSave>(SAVE_KEY)
    if (!saved || !saved.stocks?.length) {
      save()
      return
    }
    day.value = saved.day ?? 1
    cash.value = saved.cash ?? INITIAL_CASH
    coins.value = saved.coins ?? INITIAL_COINS
    positions.value = saved.positions ?? []
    const fresh = createStocks()
    stocks.value = saved.stocks.map((s) => {
      const def = defaultBasePrice(s.code)
      const valid = s.basePrice && s.basePrice > def * 0.5 && s.price > def * 0.25 && s.price < def * 20
      return valid ? s : (fresh.find((x) => x.code === s.code) ?? s)
    })
    stocks.value.forEach((s) => {
      if (s.dividends === undefined) s.dividends = 0
      if (s.basePrice === undefined) s.basePrice = defaultBasePrice(s.code)
    })
    positions.value.forEach((p) => {
      const s = stocks.value.find((x) => x.code === p.code)
      if (s && (p.cost < s.price * 0.05 || p.cost > s.price * 20)) p.cost = s.price
    })
    news.value = saved.news ?? []
    trades.value = saved.trades ?? []
    history.value = saved.history ?? []
    rivals.value = saved.rivals ?? makeRivals()
    violation.value = saved.violation ?? 0
    gameOver.value = saved.gameOver ?? false
    selectedCode.value = saved.selectedCode ?? '300059'
    leverage.value = saved.leverage ?? 1
    autoBuy.value = saved.autoBuy ?? false
    const elapsed = Date.now() - (saved.lastTick ?? Date.now())
    if (elapsed > DAY_MS) {
      const missed = Math.min(5000, Math.floor(elapsed / DAY_MS))
      for (let i = 0; i < missed; i++) advanceDay(true)
      notify(`离线期间行情走了 ${missed} 个交易日`, 'meme')
    }
    lastTick.value = Date.now()
    save()
  }

  function start(): void {
    if (gameOver.value) return
    running.value = true
    lastTick.value = Date.now()
  }

  function pause(): void {
    running.value = false
    save()
  }

  function setSpeed(s: number): void {
    speed.value = s
  }

  function tick(): void {
    if (!running.value || gameOver.value) return
    if (Date.now() - lastTick.value < DAY_MS / speed.value) return
    lastTick.value = Date.now()
    advanceDay(true)
    if (autoBuy.value) buy(100, true)
    if (day.value % 25 === 0) save()
  }

  function pushNews(item: NewsItem): void {
    news.value.unshift({ ...item, time: nowTime() })
    if (news.value.length > 120) news.value.pop()
  }

  function updateRivals(upCount: number): void {
    const configs = [
      { drift: 0.0022 + (upCount > 0 ? 0.004 : -0.002), vol: 0.035 },
      { drift: 0.0028, vol: 0.018 },
      { drift: 0.0018, vol: 0.012 }
    ]
    rivals.value.forEach((r, i) => {
      const c = configs[i]
      r.assets = Math.max(1000, r.assets * (1 + c.drift + randn() * c.vol))
    })
  }

  function randn(): number {
    let u = 0
    let v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }

  function applyCard(card: MemeCard): void {
    todayCard.value = card
    lastCardDay.value = day.value
    const s = pick(stocks.value)
    switch (card.id) {
      case 'oldcomrade':
        stocks.value.forEach((x) => (x.eventBias += rand(0.012, 0.025)))
        break
      case 'teacher':
        stocks.value.forEach((x) => (x.eventBias -= rand(0.008, 0.016)))
        break
      case 'threesun':
        s.eventBias += 0.035
        break
      case 'goodout':
        (positions.value.length ? stocks.value.find((x) => x.code === positions.value[0].code) : s)!.eventBias -= 0.03
        break
      case 'quant':
        s.eventBias -= 0.028
        break
      case 'believe':
        s.eventBias += 0.038
        s.concept = '光伏'
        break
      case 'groundsky':
        s.eventBias += 0.06
        break
      case 'short':
        s.eventBias += 0.05
        pushNews(squeezeNews(day.value, s))
        break
      default:
        break
    }
    pushNews(makeNews(day.value, `【梗卡】${card.title}`, card.desc, card.tone, s.code))
  }

  function checkViolation(): void {
    if (violation.value < 3) return
    violation.value = 0
    stocks.value.forEach((s) => (s.eventBias -= 0.035))
    pushNews(makeNews(day.value, '交易所下发问询函：请说明近期信息披露的真实性', '违规操作累计过多，市场情绪降温。', 'bad'))
    notify('违规次数过多，收到监管问询函！', 'bad')
  }

  function advanceDay(silent = false): void {
    day.value += 1
    trend.value = clamp(trend.value + randn() * 0.0012, -0.004, 0.006)
    const step = stepMarket(stocks.value, day.value, index.value, trend.value)
    index.value = step.index
    sentiment.value = step.sentiment

    if (Math.random() < 0.35) ambientNews(day.value, stocks.value).forEach(pushNews)
    updateRivals(step.limitUpCount)

    if (Math.random() < 0.05) {
      const s = pick(stocks.value)
      s.eventBias += rand(0.04, 0.085)
      pushNews(squeezeNews(day.value, s))
    }
    if (day.value !== lastCardDay.value && Math.random() < 0.06) {
      applyCard(pick(MEME_CARDS))
    }

    coins.value += 10
    checkViolation()

    for (const s of stocks.value) {
      if (s.dividends === undefined) s.dividends = 0
      if (s.basePrice === undefined) s.basePrice = s.anchor
      if (s.price >= s.basePrice * DIVIDEND_TRIGGER) {
        const factor = applyDividend(s, +(s.basePrice * DIVIDEND_BASE_RATIO).toFixed(2))
        const pos = positions.value.find((p) => p.code === s.code)
        let reward = 300
        if (pos) {
          const value = s.price * pos.shares * factor
          pos.shares = Math.round(pos.shares * factor)
          pos.cost /= factor
          reward = Math.max(600, Math.round(value * 0.03))
        }
        coins.value += reward
        const line = pick([
          `${s.name}公告：2026年度权益分派方案落地，股价除权`,
          `${s.name}：股价太高怕散户买不起，公司决定送股降压`,
          `${s.name}完成分红除权，股吧高呼"填权行情马上来"`
        ])
        pushNews(makeNews(day.value, line, `前复权已完成，持仓股数同步扩大，分红奖励 ${reward} 游戏币。`, 'good', s.code))
        notify(`${s.name} 除权分红，+${reward} 游戏币`, 'good')
        fireFx('dividend')
      }
    }

    const sel = selectedStock.value
    if (sel.price >= sel.limitUp * 0.998 && day.value - lastLimitFxDay.value > 12) {
      lastLimitFxDay.value = day.value
      fireFx('limitup')
    }

    history.value.push({ day: day.value, asset: totalAsset.value })
    if (history.value.length > 300) history.value.shift()
    if (!silent) save()
  }

  function stepOnce(): void {
    advanceDay(false)
    if (autoBuy.value) buy(100, true)
    lastTick.value = Date.now()
  }

  function selectStock(code: string): void {
    selectedCode.value = code
    financeTarget.value = ''
  }

  function buy(shares: number, silent = false): void {
    const s = selectedStock.value
    if (shares <= 0 || shares % 100 !== 0) {
      if (!silent) notify('委托数量必须是 100 股的整数倍', 'bad')
      return
    }
    const actual = shares * leverage.value
    const amount = s.price * actual
    const fee = buyFee(amount)
    cash.value -= amount + fee
    const pos = positions.value.find((p) => p.code === s.code)
    if (pos) {
      pos.cost = (pos.cost * pos.shares + amount + fee) / (pos.shares + actual)
      pos.shares += actual
      pos.buyDay = day.value
    } else {
      positions.value.push({ code: s.code, shares: actual, cost: (amount + fee) / actual, buyDay: day.value })
    }
    trades.value.unshift({ id: uid(), day: day.value, code: s.code, name: s.name, side: 'buy', price: s.price, shares: actual, amount, fee })
    s.eventBias += rand(0.05, 0.095)
    s.memeTag = '买入即涨'
    if (!silent) {
      pushNews(makeNews(day.value, `【买进就涨】你刚买入 ${s.name}，主力立刻拉升`, `${actual} 股成交 · ${leverage.value}x 杠杆 · 股价应声上涨`, 'good', s.code))
      notify(`买入即拉升！${actual} 股已上车`, 'good')
      fireFx('buy')
      save()
    }
  }

  function sell(shares: number): void {
    const s = selectedStock.value
    const pos = positions.value.find((p) => p.code === s.code)
    if (!pos) {
      notify('你还没有持有这只股票', 'bad')
      return
    }
    if (day.value <= pos.buyDay && !autoBuy.value) {
      notify('A股 T+1：今天买入，明天才能卖出（自动做多模式下豁免）', 'bad')
      return
    }
    if (shares <= 0) {
      notify('卖出数量必须大于 0', 'bad')
      return
    }
    if (shares !== pos.shares && shares % 100 !== 0) {
      notify('除全部卖出零股外，数量需为 100 股整数倍', 'bad')
      return
    }
    if (shares > pos.shares) {
      notify('卖出数量超过持仓', 'bad')
      return
    }
    const amount = s.price * shares
    const fee = sellFee(amount)
    const pnl = (s.price - pos.cost) * shares - fee
    cash.value += amount - fee
    pos.shares -= shares
    if (pos.shares === 0) positions.value = positions.value.filter((p) => p.code !== s.code)
    trades.value.unshift({ id: uid(), day: day.value, code: s.code, name: s.name, side: 'sell', price: s.price, shares, amount, fee, pnl })
    coins.value += Math.max(0, pnl * 0.01)
    s.eventBias -= rand(0.05, 0.095)
    s.memeTag = '卖出就跌'
    pushNews(makeNews(day.value, `【卖出就跌】你一卖 ${s.name}，股价应声跳水`, '散户的自我修养：一买就涨，一卖就跌', 'bad', s.code))
    notify(`${s.name} 卖出 ${shares} 股，盈亏 ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}`, pnl >= 0 ? 'good' : 'bad')
    fireFx('sell')
    save()
  }

  function sellPosition(code: string): void {
    const pos = positions.value.find((p) => p.code === code)
    if (!pos) return
    selectedCode.value = code
    sell(pos.shares)
  }

  function maxBuyQty(): number {
    return 100000
  }

  function actionCooldown(def: ActionDef): number {
    return Math.max(0, (cooldowns.value[def.id] ?? 0) - day.value)
  }

  function doAction(id: string): void {
    const def = ACTION_DEFS.find((a) => a.id === id)
    if (!def) return
    if (gameOver.value) return
    if (coins.value < def.cost) {
      notify(`游戏币不足，还差 ${(def.cost - coins.value).toFixed(0)} 币`, 'bad')
      return
    }
    if (actionCooldown(def) > 0) {
      notify(`操作冷却中，还需 ${actionCooldown(def)} 个交易日`, 'bad')
      return
    }
    coins.value -= def.cost
    cooldowns.value[def.id] = day.value + def.cooldown
    const s = selectedStock.value

    switch (id) {
      case 'goodnews':
        s.eventBias += rand(0.04, 0.085)
        pushNews(makeNews(day.value, goodNewsText(s.name, s.concept), `来源：${s.name} 官方公告（本游戏虚构）`, 'good', s.code))
        notify(`利好发布，${s.name} 预计高开`, 'good')
        break
      case 'bigbuy':
        s.eventBias += 0.035
        s.manipulation += 4
        s.controller = '不明大资金'
        pushNews(makeNews(day.value, `盘口异动：${s.name} 出现连续万手买单，疑似大资金扫货`, '大资金买入（游戏效果）', 'good', s.code))
        notify('大资金进场，股价将被推升', 'good')
        break
      case 'rumor': {
        s.eventBias += rand(0.025, 0.055)
        const caught = Math.random() < 0.35
        pushNews(makeNews(day.value, rumorText(s.name), caught ? '该消息被标记为不实信息，监管已关注' : '来源：某股吧（未证实）', caught ? 'bad' : 'meme', s.code))
        if (caught) {
          violation.value += 1
          s.eventBias -= 0.03
          notify('小作文被监管盯上了，违规 +1', 'bad')
        } else {
          notify('小作文发酵，情绪面短期走强', 'good')
        }
        break
      }
      case 'policy':
        stocks.value.forEach((x) => (x.eventBias += rand(0.008, 0.02)))
        index.value = +(index.value * rand(1.01, 1.025)).toFixed(2)
        pushNews(makeNews(day.value, '顶层政策组合拳落地：降印花税 + 长线资金入市', '政策刺激（本游戏虚构），全市场受益', 'good'))
        notify('政策利好，全市场普涨', 'good')
        break
      case 'ma': {
        const good = Math.random() < 0.55
        if (good) {
          s.eventBias += rand(0.05, 0.09)
          s.concept = pick(CONCEPTS)
          pushNews(makeNews(day.value, `${s.name}公告：拟收购优质资产，实现"蛇吞象"式跨界重组`, '并购重组（游戏虚构）', 'good', s.code))
          notify('重组标的优质，市场给予溢价', 'good')
        } else {
          s.eventBias -= rand(0.035, 0.07)
          violation.value += 1
          pushNews(makeNews(day.value, `${s.name}重组标的曝出商誉减值风险，复牌承压`, '并购重组踩雷', 'bad', s.code))
          notify('重组踩雷，商誉减值预警', 'bad')
        }
        break
      }
      case 'finance':
        financeTarget.value = s.code
        notify('财报编辑器已打开，修改基础值会影响短期股价', 'meme')
        break
      case 'chart':
        s.manipulation += 5
        s.eventBias += 0.018
        s.controller = '控盘主力'
        pushNews(makeNews(day.value, `${s.name}技术形态走强：均线金叉、放量突破平台`, '有人在用真金白银画图（游戏效果）', 'meme', s.code))
        notify('图形画好了，技术派正在进场', 'meme')
        break
      case 'hot':
        s.concept = pick(CONCEPTS)
        s.eventBias += 0.045
        pushNews(makeNews(day.value, `${s.name}：公司宣布切入${s.concept}赛道，已组建专项团队`, '蹭热点（游戏虚构）', 'meme', s.code))
        notify(`已蹭上「${s.concept}」热点`, 'meme')
        break
      case 'team':
        s.eventBias += 0.035
        violation.value += 1
        pushNews(makeNews(day.value, `${s.name}龙虎榜：拉萨天团大举买入，散户大本营集结`, '短期情绪推升，但监管关注度上升', 'meme', s.code))
        notify('拉萨天团进场，小心监管问询', 'meme')
        break
      case 'squeeze':
        s.eventBias += rand(0.05, 0.09)
        pushNews(squeezeNews(day.value, s))
        notify('空头爆仓了，多头吃肉', 'good')
        break
    }
    checkViolation()
    save()
  }

  function setFinanceField(field: 'revenue' | 'cost' | 'otherIncome' | 'shares' | 'pe', value: number): void {
    const s = stocks.value.find((x) => x.code === financeTarget.value)
    if (!s) return
    const bounds: Record<string, [number, number]> = {
      revenue: [1, 20000],
      cost: [0, 20000],
      otherIncome: [0, 2000],
      shares: [1, 500],
      pe: [1, 100]
    }
    const [min, max] = bounds[field]
    s.finance[field] = clamp(value, min, max)
    applyFinanceImpact(s)
  }

  function financeResult(code: string) {
    const s = stocks.value.find((x) => x.code === code)
    return s ? calcFinance(s.finance) : null
  }

  return {
    day, cash, coins, positions, stocks, news, trades, history, index, trend, sentiment,
    rivals, running, speed, gameOver, violation, selectedCode, leverage, autoBuy, cooldowns, toasts, fxSignal, fxType, lastTick,
    todayCard, lastCardDay, financeTarget,
    selectedStock, positionValue, totalAsset, totalReturn, positionCount, ranking, myRank, dividendProgress,
    init, reset, start, pause, setSpeed, tick, stepOnce, selectStock, buy, sell, sellPosition,
    maxBuyQty, doAction, actionCooldown, setFinanceField, financeResult, notify, save
  }
})
