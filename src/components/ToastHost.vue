<script setup lang="ts">
import { useGameStore } from '@/stores/game'

const store = useGameStore()
</script>

<template>
  <div class="host">
    <div v-for="t in store.toasts" :key="t.id" class="toast" :class="t.tone">{{ t.text }}</div>
  </div>
</template>

<style scoped>
.host { position: fixed; right: 18px; bottom: 120px; z-index: 100; display: flex; flex-direction: column; gap: 8px; align-items: flex-end; pointer-events: none; }
.toast { background: rgba(17, 26, 43, .97); border: 1px solid var(--line); border-left: 3px solid var(--blue); border-radius: 8px; padding: 10px 14px; font-size: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, .4); animation: slide .25s ease; max-width: 340px; }
.toast.good { border-left-color: var(--up); }
.toast.bad { border-left-color: var(--down); }
.toast.meme { border-left-color: var(--purple); }
@keyframes slide { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
</style>
