<script setup lang="ts">
import { ACTION_DEFS } from '@/engine/events'
import { useGameStore } from '@/stores/game'

const store = useGameStore()
</script>

<template>
  <section class="panel action-panel">
    <div class="panel-head">
      <h2>操盘工具箱 <span class="sub">所有操作消耗游戏币</span></h2>
      <span class="hint">每交易日 +10 币 · 分红奖励是大头</span>
    </div>
    <div class="grid">
      <button
        v-for="a in ACTION_DEFS"
        :key="a.id"
        class="action"
        :class="a.tone"
        :disabled="store.coins < a.cost || store.actionCooldown(a) > 0 || store.gameOver"
        :title="a.desc"
        @click="store.doAction(a.id)"
      >
        <span class="icon">{{ a.icon }}</span>
        <span class="text"><b>{{ a.name }}</b></span>
        <span class="cost">{{ store.actionCooldown(a) > 0 ? `冷却${store.actionCooldown(a)}日` : `${a.cost} 币` }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.sub { color: var(--muted); font-size: 10px; font-weight: 400; margin-left: 6px; }
.grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 7px; padding: 9px; }
.action { display: flex; flex-direction: row; align-items: center; gap: 6px; text-align: left; padding: 6px 8px; border: 1px solid var(--line); border-radius: 9px; background: rgba(22, 33, 54, .7); color: var(--text); min-width: 0; transition: .15s; }
.action:hover:not(:disabled) { transform: translateY(-2px); border-color: var(--blue); background: rgba(77, 157, 255, .1); }
.icon { width: 24px; height: 24px; border-radius: 6px; display: grid; place-items: center; background: rgba(77, 157, 255, .15); color: var(--blue); font-size: 12px; font-weight: 800; }
.action.good .icon { color: var(--up); background: rgba(255, 91, 91, .15); }
.action.bad .icon { color: var(--down); background: rgba(32, 201, 139, .15); }
.action.meme .icon { color: var(--purple); background: rgba(167, 124, 255, .15); }
.text { min-width: 0; flex: 1; }
.text b { display: block; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cost { font-size: 10px; color: var(--gold); white-space: nowrap; }
@media (max-width: 1280px) { .grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (max-width: 1050px) { .grid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
</style>
