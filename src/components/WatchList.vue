<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import type { Stock } from '@/types'
import { fmt } from '@/utils/format'

const store = useGameStore()

function change(s: Stock): number {
  return ((s.price - s.prevClose) / s.prevClose) * 100
}

function spark(s: Stock): string {
  const arr = s.candles.slice(-22).map((c) => c.close)
  const min = Math.min(...arr)
  const max = Math.max(...arr)
  return arr
    .map((v, i) => `${(i / (arr.length - 1)) * 72},${22 - ((v - min) / (max - min || 1)) * 19}`)
    .join(' ')
}
</script>

<template>
  <aside class="panel watch-panel">
    <div class="panel-head">
      <h2>自选行情</h2>
      <span class="hint">{{ store.index.toFixed(2) }} · 假指数</span>
    </div>
    <div class="cols"><span>名称 / 代码</span><span>最新</span><span>涨跌</span></div>
    <div class="list scroll">
      <button
        v-for="s in store.stocks"
        :key="s.code"
        class="row"
        :class="{ active: s.code === store.selectedCode }"
        @click="store.selectStock(s.code)"
      >
        <div class="left">
          <b>{{ s.name }}</b>
          <small>{{ s.code }} · {{ s.industry }}</small>
          <svg viewBox="0 0 72 24" class="spark" preserveAspectRatio="none">
            <polyline :points="spark(s)" fill="none" :stroke="change(s) >= 0 ? 'var(--up)' : 'var(--down)'" stroke-width="1.4" />
          </svg>
        </div>
        <div class="right num">
          <b :key="s.price" class="price-flash" :class="change(s) >= 0 ? 'up' : 'down'">{{ fmt(s.price) }}</b>
          <small :class="change(s) >= 0 ? 'up' : 'down'">{{ change(s) >= 0 ? '+' : '' }}{{ change(s).toFixed(2) }}%</small>
        </div>
      </button>
    </div>
    <div class="sentiment">
      <div class="sent-head"><span>市场情绪</span><b>{{ store.sentiment > 0.65 ? '亢奋' : store.sentiment > 0.45 ? '震荡' : '恐慌' }}</b></div>
      <div class="sent-bar"><i :style="{ width: store.sentiment * 100 + '%' }" /></div>
      <div class="sent-foot">
        <span>违规值 {{ store.violation }}/3</span>
        <span>模拟走势 · 非真实行情</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.watch-panel { overflow: hidden; }
.cols { display: grid; grid-template-columns: 1fr 66px 60px; gap: 4px; padding: 8px 12px; font-size: 10px; color: var(--muted); border-bottom: 1px solid var(--line); }
.cols span:not(:first-child) { text-align: right; }
.list { flex: 1; padding: 5px; }
.row { width: 100%; display: grid; grid-template-columns: 1fr 66px 60px; gap: 4px; text-align: left; background: transparent; border: 1px solid transparent; border-radius: 8px; padding: 7px 7px; color: var(--text); align-items: center; transition: .15s; }
.row:hover { background: rgba(77, 157, 255, .08); }
.row.active { background: rgba(77, 157, 255, .14); border-color: rgba(77, 157, 255, .35); }
.left { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.left b { font-size: 13px; }
.left small { font-size: 10px; color: var(--muted); }
.spark { width: 100%; height: 20px; margin-top: 3px; opacity: .85; }
.right { display: contents; }
.right b { font-size: 12px; text-align: right; }
.right small { font-size: 10px; text-align: right; }
.sentiment { flex: none; padding: 11px 13px; border-top: 1px solid var(--line); }
.sent-head, .sent-foot { display: flex; justify-content: space-between; font-size: 10px; color: var(--muted); }
.sent-head b { color: var(--text); }
.sent-bar { height: 6px; background: #22304a; border-radius: 4px; margin: 7px 0; overflow: hidden; }
.sent-bar i { display: block; height: 100%; background: linear-gradient(90deg, var(--down), var(--gold), var(--up)); }
</style>
