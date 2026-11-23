<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import TopBar from '@/components/TopBar.vue'
import WatchList from '@/components/WatchList.vue'
import KlineChart from '@/components/KlineChart.vue'
import ActionPanel from '@/components/ActionPanel.vue'
import NewsFeed from '@/components/NewsFeed.vue'
import TradePanel from '@/components/TradePanel.vue'
import HoldingsTable from '@/components/HoldingsTable.vue'
import RankBoard from '@/components/RankBoard.vue'
import TradeLog from '@/components/TradeLog.vue'
import FinanceEditor from '@/components/FinanceEditor.vue'
import RulesModal from '@/components/RulesModal.vue'
import FxOverlay from '@/components/FxOverlay.vue'

const store = useGameStore()
const showRules = ref(false)
let timer: number | undefined

onMounted(() => {
  const hadSave = !!localStorage.getItem('ashare-meme-save-v1')
  store.init()
  store.start()
  showRules.value = !hadSave
  timer = window.setInterval(() => store.tick(), 200)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<template>
  <div class="app-shell">
    <TopBar />
    <div class="ticker">
      <span class="ticker-tag">实时快讯</span>
      <div class="ticker-window">
        <div class="ticker-track">
          <template v-if="store.news.length">
            <span v-for="n in store.news.slice(0, 12)" :key="n.id" :class="n.tone">
              【{{ n.tone === 'good' ? '利好' : n.tone === 'bad' ? '利空' : n.tone === 'meme' ? '热梗' : '公告' }}】{{ n.title }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </span>
          </template>
          <span v-else>2126 年模拟行情已就绪 · 买入必涨 · 卖出必跌 · 资金无限 · 杠杆拉满</span>
        </div>
      </div>
    </div>

    <main class="workspace">
      <WatchList />
      <div class="center-column">
        <KlineChart />
        <ActionPanel />
        <NewsFeed />
      </div>
      <div class="right-column">
        <TradePanel />
        <HoldingsTable />
        <RankBoard />
      </div>
    </main>
    <TradeLog />

    <FxOverlay />
    <div class="fx-layer" aria-hidden="true">
      <div class="watermark">模拟</div>
      <div class="scanline" />
    </div>

    <FinanceEditor />
    <RulesModal :visible="showRules" @close="showRules = false" />
  </div>
</template>
