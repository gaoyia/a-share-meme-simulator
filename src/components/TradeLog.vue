<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { fmt } from '@/utils/format'

const store = useGameStore()
</script>

<template>
  <footer class="panel log-bar">
    <div class="title">成交记录 <span class="muted">（{{ store.trades.length }} 笔）</span></div>
    <div class="scroll list">
      <template v-if="store.trades.length">
        <div v-for="t in store.trades.slice(0, 30)" :key="t.id" class="log">
          <span class="day">D{{ t.day }}</span>
          <span class="side" :class="t.side">{{ t.side === 'buy' ? '买入' : '卖出' }}</span>
          <b>{{ t.name }}</b>
          <span>{{ t.shares }} 股 @ {{ fmt(t.price) }}</span>
          <span class="muted">费用 {{ fmt(t.fee) }}</span>
          <span v-if="t.pnl !== undefined" class="num" :class="t.pnl >= 0 ? 'up' : 'down'">
            {{ t.pnl >= 0 ? '+' : '' }}{{ fmt(t.pnl) }}
          </span>
        </div>
      </template>
      <div v-else class="muted empty">暂无成交，点左侧自选股 → 输入数量 → 买入做多。</div>
    </div>
  </footer>
</template>

<style scoped>
.log-bar { flex: none; height: 96px; flex-direction: row; margin: 0 12px 12px; overflow: hidden; }
.title { flex: none; writing-mode: vertical-rl; text-orientation: upright; font-size: 10px; letter-spacing: 2px; color: var(--muted); padding: 10px 8px; border-right: 1px solid var(--line); }
.title .muted { writing-mode: horizontal-tb; display: none; }
.list { flex: 1; padding: 8px 12px; display: flex; flex-direction: column; gap: 5px; }
.log { display: flex; gap: 12px; align-items: center; font-size: 11px; white-space: nowrap; }
.log .day { color: var(--muted); font-size: 10px; }
.side { font-size: 9px; padding: 2px 5px; border-radius: 4px; }
.side.buy { color: var(--up); border: 1px solid rgba(255, 91, 91, .4); }
.side.sell { color: var(--down); border: 1px solid rgba(32, 201, 139, .4); }
.empty { font-size: 11px; padding: 20px 0; }
</style>
