import type { ActionDef, NewsItem, Stock, Tone } from '@/types'
import { pick, rand, uid } from '@/utils/format'

export interface MemeCard {
  id: string
  title: string
  desc: string
  tone: Tone
}

export const ACTION_DEFS: ActionDef[] = [
  { id: 'goodnews', name: '发布重大利好', icon: '公', desc: '编一条利好公告：订单、突破、跨界，应有尽有。', cost: 800, tone: 'good', target: 'stock', cooldown: 2 },
  { id: 'bigbuy', name: '大资金买入', icon: '资', desc: '真金白银拉抬股价，顺便让量化帮你抬轿。', cost: 1200, tone: 'good', target: 'stock', cooldown: 3 },
  { id: 'rumor', name: '股吧小作文', icon: '帖', desc: '深夜发文："内部人士透露，看见 10 倍空间"。可能被问询。', cost: 300, tone: 'meme', target: 'stock', cooldown: 1 },
  { id: 'policy', name: '出政策刺激', icon: '策', desc: '降印花税、国家队入场、暂停 IPO，全市场普涨（也可能一日游）。', cost: 2000, tone: 'good', target: 'market', cooldown: 5 },
  { id: 'ma', name: '并购重组', icon: '并', desc: '蛇吞象还是商誉暴雷？抽盲盒决定命运。', cost: 1500, tone: 'meme', target: 'stock', cooldown: 4 },
  { id: 'finance', name: '修改财报', icon: '财', desc: '调营收、成本、股本，公式自动算利润和合理价。', cost: 600, tone: 'meme', target: 'stock', cooldown: 3 },
  { id: 'chart', name: '控盘做图形', icon: '线', desc: '花钱画金叉、突破、涨停板，技术派看了都说好。', cost: 1000, tone: 'meme', target: 'stock', cooldown: 3 },
  { id: 'hot', name: '蹭热点概念', icon: '热', desc: '公司宣布加码现有概念主线，股吧直呼"格局打开"。', cost: 500, tone: 'meme', target: 'stock', cooldown: 2 },
  { id: 'team', name: '拉萨天团接盘', icon: '散', desc: '散户大本营进场接盘，短期拉抬，但容易被监管盯上。', cost: 700, tone: 'meme', target: 'stock', cooldown: 3 },
  { id: 'squeeze', name: '逼空爆仓', icon: '空', desc: '传说有机构做空你持有的股票，结果被涨停逼到爆仓。', cost: 400, tone: 'meme', target: 'stock', cooldown: 4 }
]

export const MEME_CARDS: MemeCard[] = [
  { id: 'oldcomrade', title: '老乡别走', desc: '跌麻了？监管喊话：老乡别走，我们错了。全市场反弹。', tone: 'good' },
  { id: 'teacher', title: '老师，能买吗？', desc: '股吧回复破万，情绪过热，短期顶部信号。', tone: 'bad' },
  { id: 'threesun', title: '三根阳线改变信仰', desc: '连续上涨后散户集体看多，趋势加速。', tone: 'good' },
  { id: 'goodout', title: '利好出尽是利空', desc: '利好兑现，获利盘砸盘，高开低走。', tone: 'bad' },
  { id: 'quant', title: '量化又来收割了', desc: '盘口突然出现万手卖单，短线砸盘。', tone: 'bad' },
  { id: 'believe', title: '相信光', desc: '赛道信仰回归，相关概念集体拉升。', tone: 'good' },
  { id: 'groundsky', title: '地天板', desc: '跌停打开直线拉涨停，一天完成一轮牛熊。', tone: 'meme' },
  { id: 't1', title: 'T+1 锁死', desc: '今天买入明天才能卖，主力：就问你慌不慌。', tone: 'neutral' },
  { id: 'index', title: '指数又新高了', desc: '大盘 4200 点，我的账户还停留在 3000 点。', tone: 'meme' },
  { id: 'short', title: '做空的人爆仓了', desc: '空头以为见顶，结果被连续涨停抬走。', tone: 'good' }
]

const GOOD_NEWS = [
  (n: string) => `${n}公告：签署 58 亿元重大合同，占去年营收 32%`,
  (n: string) => `${n}：拟斥资 120 亿跨界布局低空经济，设立全资子公司`,
  (n: string) => `${n}新一代产品发布，机构连夜上调目标价：看见 10 倍空间`,
  (n: string) => `${n}获地方产业基金战略入股，股吧高呼"格局打开"`,
  (n: string) => `${n}回购 20 亿股份并注销，董事长：股价严重低估`,
  (n: string) => `${n}核心技术突破"卡脖子"难题，国产替代空间打开`
]

const BAD_NEWS = [
  (n: string) => `${n}收到交易所问询函，要求说明相关信息披露真实性`,
  (n: string) => `${n}第三大股东拟减持不超过 3% 股份，理由是"个人资金需求"`,
  (n: string) => `${n}业绩预告：净利润同比下滑 42%，低于市场预期`,
  (n: string) => `${n}被曝大客户订单流失，机构：短期承压`,
  (n: string) => `${n}商誉减值 15 亿，年报由盈转亏`,
  (n: string) => `${n}高管密集减持，股吧："老乡别走"`
]

const MEME_NEWS = [
  (n: string) => `深夜小作文刷屏：《${n}即将获得星际订单》，股吧沸腾`,
  (n: string) => `拉萨天团再度上榜 ${n}，散户大本营积极接盘`,
  (n: string) => `${n}股吧热帖："老师，现在能买吗？"回复已破一万条`,
  (n: string) => `量化席位现身 ${n} 龙虎榜，游资：这波是量化在抬轿`,
  (n: string) => `${n}连续三天收阳，股民：这次不一样，真的不一样`,
  (n: string) => `某大 V 喊单 ${n}："不上车就错过一个时代"`,
  (n: string) => `${n}跌停板打开又封上，一天走完一轮牛熊`,
  (n: string) => `传 ${n} 将被纳入某国际指数，消息尚未证实`
]

const POLICY_NEWS = [
  '财政部官宣：证券交易印花税减半征收，股民：终于等到你',
  '国家队资金入市，宽基 ETF 单日净流入超 200 亿',
  '证监会：阶段性收紧 IPO 节奏，市场供给压力缓解',
  '央行宣布降准 0.5 个百分点，释放长期资金约 1 万亿',
  '监管喊话：欢迎长期资金入市，老乡别走'
]

const SQUEEZE_NEWS = [
  (n: string) => `【爆仓】某百亿级私募做空 ${n} 被逼空，单日亏损 2.3 亿，已被强制平仓`,
  (n: string) => `【天台见】空头在 ${n} 涨停前一夜加仓，开盘直接被抬走`,
  (n: string) => `【逼空行情】${n} 空头集体投降，轧空资金推升股价连续涨停`,
  (n: string) => `【反向指标】做空 ${n} 的机构爆仓，股吧：感谢空头送筹码`
]

export function makeNews(day: number, title: string, detail: string, tone: Tone, code?: string): NewsItem {
  return { id: uid(), day, time: '', title, detail, tone, code }
}

export function ambientNews(day: number, stocks: Stock[]): NewsItem[] {
  const out: NewsItem[] = []
  const count = Math.random() < 0.35 ? 2 : 1
  for (let i = 0; i < count; i++) {
    const s = pick(stocks)
    const roll = Math.random()
    if (roll < 0.3) {
      out.push(makeNews(day, pick(GOOD_NEWS)(s.name), `影响标的：${s.code} ${s.name}`, 'good', s.code))
    } else if (roll < 0.55) {
      out.push(makeNews(day, pick(BAD_NEWS)(s.name), `影响标的：${s.code} ${s.name}`, 'bad', s.code))
    } else if (roll < 0.92) {
      out.push(makeNews(day, pick(MEME_NEWS)(s.name), `来源：某股吧 / 某社交平台`, 'meme', s.code))
    } else {
      out.push(makeNews(day, pick(POLICY_NEWS), '来源：权威部门（本游戏虚构）', 'good'))
    }
  }
  return out
}

export function squeezeNews(day: number, stock: Stock): NewsItem {
  return makeNews(day, pick(SQUEEZE_NEWS)(stock.name), `做空 ${stock.name} 的机构已被强制平仓。空头死了，多头吃肉。`, 'good', stock.code)
}

export function goodNewsText(name: string, concept: string): string {
  const templates = [
    `${name}公告：与某头部企业签署 ${Math.round(rand(20, 90))} 亿元战略合作协议`,
    `${name}：拟加码${concept}布局，成立全资子公司`,
    `${name}新一代产品量产，良率超预期，订单已排到明年`,
    `${name}获国家级专项基金重点支持，行业地位进一步巩固`,
    `${name}宣布回购 ${Math.round(rand(5, 30))} 亿元股份，董事长称"被严重低估"`
  ]
 return pick(templates)
}

export function rumorText(name: string): string {
  return pick([
    `深夜小作文：《${name}即将拿下海外超级大单，看见十倍空间》`,
    `网传 ${name} 将由某巨头借壳，知情人士称"基本确定"`,
    `内部消息：${name} 明日将公告重大资产重组（未证实）`,
    `${name} 被pt 列入某超级基金首选标的，目标是星辰大海`
  ])
}
