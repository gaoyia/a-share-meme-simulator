<script setup lang="ts">
import { useGameStore } from '@/stores/game'

const store = useGameStore()
defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

function close(): void {
  emit('close')
  store.start()
}
</script>

<template>
  <div v-if="visible" class="overlay">
    <div class="modal">
      <div class="badge">开局说明</div>
      <h2>欢迎来到 A股做多模拟器 · 梗版</h2>
      <p class="lead">欢迎来到 2126 年。资金无限、杠杆拉满、买进就涨、卖出就跌。指数是假的，走势是编的，股票名字是真的，梗是认真的。纯属娱乐，与真实公司无关。</p>
      <div class="grid">
        <div><span>01</span><p><b>无限做多</b>资金 ∞，支持 1/2/5/10x 杠杆，还能开「自动做多」每秒扫货。买进就涨、卖出就跌——你就是主力。做空爆仓只以梗事件出现。</p></div>
        <div><span>02</span><p><b>操盘工具箱</b>发利好、小作文、大资金买入、政策刺激、并购重组、蹭热点、控盘画线，全部花游戏币。</p></div>
        <div><span>03</span><p><b>财报实验室</b>改营收、成本、股本、市盈率，系统按公式算利润和合理价，影响短期股价但不改长期趋势。</p></div>
        <div><span>04</span><p><b>全面牛市</b>默认每秒 4 个交易日，全市场普遍上涨，只有明显利空才跌。买入、卖出、分红都会触发屏幕震动和礼花特效。</p></div>
        <div><span>05</span><p><b>违规值</b>乱发小作文、操纵龙虎榜会累积违规，满 3 次收问询函，全市场回调。</p></div>
        <div><span>06</span><p><b>无限期 + 分红</b>没有结算日。股价涨太多公司就送股除权（前复权），持仓股数同步增加，还送你游戏币。一直涨，一直送。</p></div>
      </div>
      <button class="btn btn-primary big" @click="close">开始模拟</button>
    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(4, 8, 15, .88); display: grid; place-items: center; z-index: 80; backdrop-filter: blur(6px); }
.modal { width: min(720px, 94vw); max-height: 92vh; overflow: auto; background: linear-gradient(160deg, #152137, #101a2b); border: 1px solid #2b3b58; border-radius: 16px; padding: 26px; box-shadow: 0 30px 90px rgba(0, 0, 0, .6); }
.badge { display: inline-block; font-size: 10px; color: var(--gold); border: 1px solid rgba(247, 201, 72, .4); border-radius: 5px; padding: 3px 8px; }
h2 { margin: 12px 0 8px; font-size: 21px; }
.lead { color: var(--muted); font-size: 12px; line-height: 1.7; margin: 0 0 18px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
.grid > div { display: flex; gap: 9px; background: rgba(12, 20, 34, .6); border: 1px solid var(--line); border-radius: 9px; padding: 11px; }
.grid span { color: var(--blue); font-size: 11px; font-weight: 800; }
.grid p { margin: 0; font-size: 11px; line-height: 1.6; color: var(--muted); }
.grid b { color: var(--text); display: block; margin-bottom: 3px; }
.big { width: 100%; padding: 13px; font-size: 14px; }
@media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
</style>
