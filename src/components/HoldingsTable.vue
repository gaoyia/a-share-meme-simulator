<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { fmt } from '@/utils/format'

const store = useGameStore()
const rows = computed(() =>
  store.positions.map((p) => {
    const s = store.stocks.find((x) => x.code === p.code)!
    const value = s.price * p.shares
    const pnl = (s.price - p.cost) * p.shares
    return { ...p, name: s.name, price: s.price, value, pnl, rate: (s.price / p.cost - 1) * 100, locked: store.day <= p.buyDay }
  })
)
</script>

<template>
  <section class="panel holdings-panel">
    <div class="panel-head">
      <h2>我的持仓</h2>
      <span class="hint">{{ rows.length }} 只 · 市值 {{ fmt(store.positionValue) }}</span>
    </div>
    <div class="list scroll">
      <div v-for="r in rows" :key="r.code" class="row">
        <div class="top">
          <b>{{ r.name }}</b><span>{{ r.code }}</span>
          <button :disabled="store.gameOver" @click="store.sellPosition(r.code)">卖出</button>
        </div>
        <div class="cells">
          <span><small>持股</small><b>{{ r.shares }}</b></span>
          <span><small>成本</small><b>{{ fmt(r.cost) }}</b></span>
          <span><small>现价</small><b>{{ fmt(r.price) }}</b></span>
          <span><small>盈亏</small><b class="num" :class="r.pnl >= 0 ? 'up' : 'down'">{{ r.pnl >= 0 ? '+' : '' }}{{ fmt(r.pnl) }}</b></span>
        </div>
        <div class="rate" :class="r.rate >= 0 ? 'up' : 'down'">
          {{ r.rate >= 0 ? '+' : '' }}{{ r.rate.toFixed(2) }}%
          <span v-if="r.locked" class="lock">T+1 锁定</span>
        </div>
      </div>
      <div v-if="!rows.length" class="empty muted">暂无持仓。只能做多，低买高卖。</div>
    </div>
  </section>
</template>

<style scoped>
.list { flex: 1; padding: 7px; }
.row { border: 1px solid var(--line); border-radius: 8px; padding: 9px 10px; margin-bottom: 7px; background: rgba(12, 20, 34, .5); }
.top { display: flex; align-items: center; gap: 7px; font-size: 12px; }
.top b { font-size: 13px; }
.top span { color: var(--muted); font-size: 10px; flex: 1; }
.top button { border: 1px solid rgba(32, 201, 139, .4); color: var(--down); background: transparent; border-radius: 5px; font-size: 10px; padding: 3px 9px; }
.cells { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-top: 8px; }
.cells span { display: flex; flex-direction: column; gap: 2px; }
.cells small { color: var(--muted); font-size: 9px; }
.cells b { font-size: 11px; }
.rate { margin-top: 6px; font-size: 11px; text-align: right; }
.lock { color: var(--muted); font-size: 9px; border: 1px solid var(--line); border-radius: 4px; padding: 1px 4px; margin-left: 6px; }
.empty { padding: 26px; text-align: center; font-size: 12px; }
</style>
