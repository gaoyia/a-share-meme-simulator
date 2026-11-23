<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { fmt, fmtPct } from '@/utils/format'

const store = useGameStore()
const levels = [1, 2, 5, 10]
const retClass = computed(() => (store.totalReturn > 0 ? 'up' : store.totalReturn < 0 ? 'down' : 'flat'))

function cycleLeverage(): void {
  const i = levels.indexOf(store.leverage)
  store.leverage = levels[(i + 1) % levels.length]
}
</script>

<template>
  <header class="topbar">
    <div class="brand">
      <div class="brand-mark">A</div>
      <div>
        <h1>A股做多模拟器 <span class="sim-badge">模拟</span></h1>
        <p>2126 年 · 纯属虚构娱乐 · 与真实公司无关</p>
      </div>
    </div>

    <div class="stats">
      <div class="stat"><span>总资产</span><b class="num">{{ fmt(store.totalAsset) }}</b></div>
      <div class="stat"><span>可用资金</span><b class="num infinite">∞</b></div>
      <div class="stat"><span>持仓市值</span><b class="num">{{ fmt(store.positionValue) }}</b></div>
      <div class="stat"><span>累计收益</span><b class="num" :class="retClass">{{ fmtPct(store.totalReturn) }}</b></div>
      <div class="stat coins"><span>游戏币</span><b class="num">{{ fmt(store.coins, 0) }}</b></div>
      <div class="stat progress-stat">
        <span>交易日 / 距分红</span><b class="num">{{ store.day }}</b>
        <div class="progress" title="距离下一次送股除权的进度"><i :style="{ width: store.dividendProgress + '%' }" /></div>
      </div>
    </div>

    <div class="actions">
      <button class="btn lev-btn" :title="'当前做多杠杆 ' + store.leverage + ' 倍'" @click="cycleLeverage">杠杆 {{ store.leverage }}x</button>
      <button class="btn" :class="store.autoBuy ? 'auto-on' : ''" @click="store.autoBuy = !store.autoBuy">
        自动做多 {{ store.autoBuy ? 'ON' : 'OFF' }}
      </button>
      <span class="speed-label">{{ 4 * store.speed }} 日/秒</span>
      <button class="btn btn-ghost" @click="store.reset()">重开</button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  flex: none; display: flex; align-items: center; gap: 14px;
  padding: 10px 16px; border-bottom: 1px solid var(--line);
  background: rgba(10, 16, 27, .92); backdrop-filter: blur(12px);
  position: relative; z-index: 5;
}
.brand { display: flex; align-items: center; gap: 10px; min-width: 230px; }
.brand-mark {
  width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center;
  background: linear-gradient(135deg, #ff5b5b, #ff9f43); font-size: 21px; font-weight: 900;
  box-shadow: 0 4px 18px rgba(255, 91, 91, .45); animation: markPulse 2.4s ease-in-out infinite;
}
@keyframes markPulse {
  0%, 100% { box-shadow: 0 4px 18px rgba(255, 91, 91, .35); }
  50% { box-shadow: 0 4px 30px rgba(255, 91, 91, .8); }
}
.brand h1 { margin: 0; font-size: 15px; letter-spacing: .5px; display: flex; align-items: center; gap: 6px; }
.sim-badge {
  font-size: 10px; color: #fff; background: var(--up); border-radius: 4px;
  padding: 2px 6px; letter-spacing: 2px; box-shadow: 0 0 12px rgba(255, 91, 91, .6);
  animation: badgeBlink 1.6s steps(2) infinite;
}
@keyframes badgeBlink { 50% { opacity: .55; } }
.brand p { margin: 3px 0 0; font-size: 10px; color: var(--muted); }
.stats { display: flex; gap: 14px; flex: 1; justify-content: center; flex-wrap: wrap; }
.stat { display: flex; flex-direction: column; gap: 2px; min-width: 86px; }
.stat span { font-size: 10px; color: var(--muted); }
.stat b { font-size: 14px; }
.stat.coins b { color: var(--gold); }
.infinite { color: var(--gold); font-size: 19px !important; line-height: 1; text-shadow: 0 0 14px rgba(247, 201, 72, .6); }
.progress-stat { min-width: 100px; }
.progress { height: 4px; background: #22304a; border-radius: 4px; margin-top: 3px; overflow: hidden; }
.progress i { display: block; height: 100%; background: linear-gradient(90deg, var(--blue), var(--purple), var(--up)); transition: width .3s; box-shadow: 0 0 8px var(--purple); }
.actions { display: flex; gap: 5px; flex-wrap: wrap; justify-content: flex-end; }
.actions .btn { padding: 6px 9px; font-size: 11px; }
.lev-btn { border-color: var(--gold); color: var(--gold); }
.auto-on { background: linear-gradient(135deg, #ff5b5b, #d93b5b); color: #fff; border-color: transparent; box-shadow: 0 0 14px rgba(255, 91, 91, .55); }
.speed-label { font-size: 10px; color: var(--muted); white-space: nowrap; padding: 0 3px; }
@media (max-width: 1300px) {
  .topbar { flex-wrap: wrap; }
  .stats { justify-content: flex-start; }
  .actions { justify-content: flex-start; }
}
</style>
