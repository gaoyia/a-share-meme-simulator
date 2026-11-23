<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { fmt } from '@/utils/format'

const store = useGameStore()
const stock = computed(() => store.stocks.find((s) => s.code === store.financeTarget))
const result = computed(() => (stock.value ? store.financeResult(stock.value.code) : null))
const fields = [
  { key: 'revenue', label: '营业收入（亿元）', step: 10 },
  { key: 'cost', label: '营业成本（亿元）', step: 10 },
  { key: 'otherIncome', label: '其他收益（亿元）', step: 1 },
  { key: 'shares', label: '总股本（亿股）', step: 1 },
  { key: 'pe', label: '行业市盈率（倍）', step: 1 }
] as const

function update(key: (typeof fields)[number]['key'], event: Event): void {
  store.setFinanceField(key, Number((event.target as HTMLInputElement).value))
}

const gap = computed(() => {
  if (!stock.value || !result.value) return 0
  return (result.value.fair / stock.value.price - 1) * 100
})
</script>

<template>
  <div v-if="stock && result" class="overlay" @click.self="store.financeTarget = ''">
    <div class="modal">
      <div class="head">
        <div><h2>财报调节实验室</h2><p>{{ stock.name }} · {{ stock.code }} · 纯娱乐，不代表真实财务数据</p></div>
        <button class="close" @click="store.financeTarget = ''">×</button>
      </div>

      <div class="formula">
        <span>净利润 = 营收 − 成本 + 其他收益</span>
        <span>EPS = 净利润 ÷ 总股本</span>
        <span>合理价 = EPS × 市盈率</span>
      </div>

      <div class="fields">
        <label v-for="f in fields" :key="f.key">
          <span>{{ f.label }}</span>
          <input type="number" :step="f.step" :value="stock.finance[f.key]" @input="update(f.key, $event)" />
        </label>
      </div>

      <div class="calc">
        <div><span>净利润</span><b class="num">{{ fmt(result.profit) }} 亿</b></div>
        <div><span>净利率</span><b class="num">{{ result.margin.toFixed(1) }}%</b></div>
        <div><span>EPS</span><b class="num">{{ result.eps.toFixed(2) }}</b></div>
        <div><span>合理价</span><b class="num gold">{{ fmt(result.fair) }}</b></div>
        <div><span>现价</span><b class="num">{{ fmt(stock.price) }}</b></div>
        <div><span>偏离</span><b class="num" :class="gap >= 0 ? 'up' : 'down'">{{ gap >= 0 ? '+' : '' }}{{ gap.toFixed(1) }}%</b></div>
      </div>

      <p class="note">修改会立刻影响短期股价，但长期趋势由市场决定。把利润调太离谱会累积违规值，小心问询函。</p>
      <button class="btn btn-primary done" @click="store.financeTarget = ''">调完了</button>
    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(4, 8, 15, .78); display: grid; place-items: center; z-index: 60; backdrop-filter: blur(4px); }
.modal { width: min(560px, 94vw); background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 20px; box-shadow: 0 24px 70px rgba(0, 0, 0, .5); }
.head { display: flex; justify-content: space-between; align-items: flex-start; }
h2 { margin: 0; font-size: 17px; }
.head p { margin: 5px 0 0; font-size: 11px; color: var(--muted); }
.close { border: none; background: transparent; color: var(--muted); font-size: 24px; line-height: 1; }
.formula { display: flex; flex-wrap: wrap; gap: 6px; margin: 14px 0; }
.formula span { font-size: 10px; color: var(--blue); background: rgba(77, 157, 255, .1); border: 1px solid rgba(77, 157, 255, .25); border-radius: 5px; padding: 4px 7px; }
.fields { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
.fields label { display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: var(--muted); }
.fields input { background: #0c1422; border: 1px solid var(--line); color: var(--text); border-radius: 7px; padding: 8px 10px; }
.calc { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 15px 0; }
.calc div { background: #0c1422; border: 1px solid var(--line); border-radius: 8px; padding: 9px; display: flex; flex-direction: column; gap: 4px; }
.calc span { font-size: 10px; color: var(--muted); }
.calc b { font-size: 13px; }
.gold { color: var(--gold); }
.note { font-size: 11px; color: var(--muted); line-height: 1.6; }
.done { width: 100%; margin-top: 6px; }
</style>
