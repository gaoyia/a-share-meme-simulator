<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import type { Tone } from '@/types'

const store = useGameStore()
const toneLabel: Record<Tone, string> = { good: '利好', bad: '利空', neutral: '公告', meme: '热梗' }
</script>

<template>
  <section class="panel news-panel">
    <div class="panel-head">
      <h2>市场快讯</h2>
      <span class="hint">第 {{ store.day }} 交易日 · 均为虚构</span>
    </div>
    <div v-if="store.todayCard" class="card-banner" :class="store.todayCard.tone">
      <span class="card-label">今日梗卡</span>
      <b>{{ store.todayCard.title }}</b>
      <span>{{ store.todayCard.desc }}</span>
    </div>
    <div class="feed scroll">
      <div v-for="n in store.news.slice(0, 40)" :key="n.id" class="item">
        <span class="day">D{{ n.day }}</span>
        <span class="tone" :class="n.tone">{{ toneLabel[n.tone] }}</span>
        <div class="body">
          <b>{{ n.title }}</b>
          <small>{{ n.detail }}</small>
        </div>
        <span class="time">{{ n.time }}</span>
      </div>
      <div v-if="!store.news.length" class="empty muted">开盘后这里会刷出各种小作文和离谱公告……</div>
    </div>
  </section>
</template>

<style scoped>
.card-banner { flex: none; display: flex; align-items: center; gap: 9px; padding: 7px 13px; font-size: 11px; border-bottom: 1px solid var(--line); background: rgba(167, 124, 255, .08); }
.card-banner.good { background: rgba(255, 91, 91, .08); }
.card-banner.bad { background: rgba(32, 201, 139, .08); }
.card-label { color: var(--gold); font-weight: 700; white-space: nowrap; }
.card-banner b { white-space: nowrap; }
.card-banner span:last-child { color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.feed { flex: 1; }
.item { display: flex; gap: 8px; align-items: flex-start; padding: 8px 13px; border-bottom: 1px solid rgba(34, 48, 74, .55); font-size: 12px; }
.day { color: var(--muted); font-size: 10px; min-width: 28px; padding-top: 2px; }
.tone { font-size: 9px; padding: 2px 5px; border-radius: 4px; min-width: 30px; text-align: center; border: 1px solid currentColor; }
.tone.good { color: var(--up); }
.tone.bad { color: var(--down); }
.tone.meme { color: var(--purple); }
.tone.neutral { color: var(--blue); }
.body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.body b { font-weight: 500; line-height: 1.4; }
.body small { color: var(--muted); font-size: 10px; }
.time { color: var(--muted); font-size: 10px; }
.empty { padding: 24px; text-align: center; font-size: 12px; }
</style>
