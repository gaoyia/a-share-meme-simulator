<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useGameStore } from '@/stores/game'
import { buyFee, fmt } from '@/utils/format'

const store = useGameStore()
const qty = ref(100)

const actualQty = computed(() => qty.value * store.leverage)
const amount = computed(() => store.selectedStock.price * actualQty.value)
const fee = computed(() => buyFee(amount.value))
const held = computed(() => store.positions.find((p) => p.code === store.selectedStock.code)?.shares ?? 0)
const canSell = computed(() => held.value > 0 && (store.autoBuy || store.day > (store.positions.find((p) => p.code === store.selectedStock.code)?.buyDay ?? 0)))

watch(() => store.selectedCode, () => { qty.value = 100 })

function setQty(v: number): void {
  qty.value = Math.max(100, Math.floor(v / 100) * 100)
}

function doBuy(): void {
  store.buy(qty.value)
}

function doSell(): void {
  store.sell(qty.value)
}
</script>

<template>
  <section class="panel trade-panel">
    <div class="panel-head">
      <h2>模拟交易</h2>
      <span class="hint">{{ store.selectedStock.name }} · {{ store.selectedStock.code }}</span>
    </div>
    <div class="inner">
      <div class="price-row">
        <div>
          <span class="muted">最新价</span>
          <b class="num big" :class="store.selectedStock.price >= store.selectedStock.prevClose ? 'up' : 'down'">{{ fmt(store.selectedStock.price) }}</b>
        </div>
        <div class="limits">
          <span>涨停 <b class="up">{{ fmt(store.selectedStock.limitUp) }}</b></span>
          <span>跌停 <b class="down">{{ fmt(store.selectedStock.limitDown) }}</b></span>
        </div>
      </div>

      <div class="label">委托数量（100 股整数倍）· 当前杠杆 {{ store.leverage }}x</div>
      <div class="qty">
        <button @click="setQty(qty - 100)">-</button>
        <input v-model.number="qty" type="number" min="100" step="100" @change="setQty(qty)" />
        <button @click="setQty(qty + 100)">+</button>
      </div>
      <div class="quick">
        <button @click="setQty(100)">100</button>
        <button @click="setQty(500)">500</button>
        <button @click="setQty(1000)">1000</button>
        <button @click="setQty(store.maxBuyQty())">最大可买</button>
      </div>

      <div class="estimate">
        <div><span>杠杆后实际买入</span><b class="num gold">{{ actualQty }} 股</b></div>
        <div><span>预估金额</span><b class="num">{{ fmt(amount) }}</b></div>
        <div><span>买入费用</span><b class="num">{{ fmt(fee) }}</b></div>
        <div class="total"><span>合计支付（资金无限）</span><b class="num">∞</b></div>
      </div>

      <div class="buttons">
        <button class="btn buy" @click="doBuy">买入做多 · 必涨</button>
        <button class="btn sell" :disabled="!canSell" @click="doSell">卖出平仓 · 必跌</button>
      </div>
      <div class="tips">
        <span>持有 {{ held }} 股</span>
        <span>{{ canSell ? '可卖出' : held ? 'T+1 锁定' : '未持仓' }}</span>
        <button @click="store.financeTarget = store.selectedStock.code">改财报</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.inner { padding: 12px 14px 14px; }
.price-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 13px; }
.price-row .muted { display: block; font-size: 10px; }
.big { font-size: 24px; }
.limits { display: flex; flex-direction: column; gap: 2px; text-align: right; font-size: 10px; color: var(--muted); }
.label { font-size: 10px; color: var(--muted); margin-bottom: 6px; }
.qty { display: flex; gap: 5px; }
.qty button { width: 34px; border: 1px solid var(--line); background: var(--panel-2); color: var(--text); border-radius: 6px; font-size: 16px; }
.qty input { flex: 1; min-width: 0; background: #0c1422; border: 1px solid var(--line); color: var(--text); border-radius: 6px; padding: 7px 9px; text-align: center; font-variant-numeric: tabular-nums; }
.quick { display: flex; gap: 5px; margin: 7px 0 11px; }
.quick button { flex: 1; font-size: 10px; padding: 5px 0; border: 1px solid var(--line); background: transparent; color: var(--muted); border-radius: 5px; }
.quick button:hover { color: var(--text); border-color: var(--blue); }
.estimate { background: #0c1422; border: 1px solid var(--line); border-radius: 8px; padding: 9px 11px; display: flex; flex-direction: column; gap: 5px; font-size: 11px; }
.estimate div { display: flex; justify-content: space-between; }
.estimate span { color: var(--muted); }
.estimate .total { border-top: 1px dashed var(--line); padding-top: 5px; }
.buttons { display: flex; gap: 8px; margin-top: 12px; }
.buttons .btn { flex: 1; padding: 10px 0; font-size: 13px; border: none; color: #fff; font-weight: 800; }
.buy { background: linear-gradient(135deg, #ff5b5b, #d93b5b); }
.sell { background: linear-gradient(135deg, #16b87a, #0e9665); }
.tips { display: flex; justify-content: space-between; align-items: center; margin-top: 9px; font-size: 10px; color: var(--muted); }
.tips button { border: 1px solid rgba(247, 201, 72, .4); background: transparent; color: var(--gold); border-radius: 5px; padding: 3px 8px; font-size: 10px; }
.warn { color: var(--up); }
</style>
