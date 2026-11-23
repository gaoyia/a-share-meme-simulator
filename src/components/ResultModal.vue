<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { fmt, fmtPct } from '@/utils/format'

const store = useGameStore()
defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'restart'): void }>()

const grade = computed(() => {
  const r = store.totalReturn
  if (r >= 60 && store.myRank === 1) return 'S'
  if (r >= 35) return 'A'
  if (r >= 15) return 'B'
  if (r >= 0) return 'C'
  return 'D'
})
const title = computed(() => {
  const map: Record<string, string> = {
    S: '天选之子，连指数都追不上你。',
    A: '这一波，你是懂A股的。',
    B: '稳健盈利，拒绝天台。',
    C: '不亏就是赢，你悟了。',
    D: '天台见？下次记得少梭哈。'
  }
  return map[grade.value]
})

function restart(): void {
  emit('restart')
  store.reset()
}
</script>

<template>
  <div v-if="visible" class="overlay">
    <div class="modal">
      <div class="grade" :class="'g-' + grade">{{ grade }}</div>
      <h2>60 个交易日结束</h2>
      <p class="lead">{{ title }}</p>
      <div class="stats">
        <div><span>最终资产</span><b class="num">{{ fmt(store.totalAsset) }}</b></div>
        <div><span>总收益率</span><b class="num" :class="store.totalReturn >= 0 ? 'up' : 'down'">{{ fmtPct(store.totalReturn) }}</b></div>
        <div><span>对手排名</span><b>{{ store.myRank }} / 4</b></div>
        <div><span>成交笔数</span><b>{{ store.trades.length }}</b></div>
      </div>
      <button class="btn btn-primary big" @click="restart">再来一局</button>
    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(4, 8, 15, .9); display: grid; place-items: center; z-index: 90; backdrop-filter: blur(6px); }
.modal { width: min(480px, 92vw); background: linear-gradient(160deg, #16233a, #101a2b); border: 1px solid #2b3b58; border-radius: 16px; padding: 26px; text-align: center; }
.grade { width: 74px; height: 74px; margin: 0 auto 14px; border-radius: 18px; display: grid; place-items: center; font-size: 40px; font-weight: 900; background: linear-gradient(135deg, #f7c948, #ff7a45); color: #1b1203; box-shadow: 0 10px 30px rgba(247, 201, 72, .3); }
.g-C { background: linear-gradient(135deg, #4d9dff, #6f7f9a); color: #fff; box-shadow: none; }
.g-D { background: linear-gradient(135deg, #20c98b, #0e8f61); color: #fff; box-shadow: none; }
h2 { margin: 0 0 8px; }
.lead { color: var(--muted); font-size: 12px; margin: 0 0 18px; }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-bottom: 20px; }
.stats div { background: #0c1422; border: 1px solid var(--line); border-radius: 9px; padding: 11px; display: flex; flex-direction: column; gap: 5px; }
.stats span { color: var(--muted); font-size: 10px; }
.stats b { font-size: 15px; }
.big { width: 100%; padding: 13px; }
</style>
