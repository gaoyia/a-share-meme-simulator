<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { fmt, fmtPct } from '@/utils/format'

const store = useGameStore()
const medals = ['1', '2', '3', '4']
</script>

<template>
  <section class="panel rank-panel">
    <div class="panel-head">
      <h2>收益排行</h2>
      <span class="hint">我的排名 {{ store.myRank }} / 4</span>
    </div>
    <div class="list scroll">
      <div v-for="(r, i) in store.ranking" :key="r.id" class="row" :class="{ me: r.id === 'me' }">
        <span class="rank" :class="'r' + i">{{ medals[i] }}</span>
        <div class="who"><b>{{ r.name }}</b><small>{{ r.tag }} · {{ r.id === 'me' ? '梭哈选手' : '模拟对手' }}</small></div>
        <div class="val"><b class="num">{{ fmt(r.assets, 0) }}</b><small :class="r.ret >= 0 ? 'up' : 'down'">{{ fmtPct(r.ret) }}</small></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.list { flex: 1; padding: 6px 8px; }
.row { display: flex; align-items: center; gap: 8px; padding: 8px 8px; border-radius: 7px; margin-bottom: 4px; }
.row.me { background: rgba(77, 157, 255, .12); border: 1px solid rgba(77, 157, 255, .3); }
.rank { width: 20px; height: 20px; border-radius: 5px; display: grid; place-items: center; font-size: 10px; font-weight: 800; background: #24314a; color: var(--muted); }
.r0 { background: linear-gradient(135deg, #f7c948, #ff9f43); color: #1a1204; }
.r1 { background: #8fa3c4; color: #111; }
.r2 { background: #b57b4a; color: #fff; }
.who { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.who b { font-size: 12px; }
.who small { color: var(--muted); font-size: 9px; }
.val { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
.val b { font-size: 11px; }
.val small { font-size: 10px; }
</style>
