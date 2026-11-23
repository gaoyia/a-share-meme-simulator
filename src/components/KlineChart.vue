<script setup lang="ts">
import * as echarts from 'echarts/core'
import { BarChart, CandlestickChart, LineChart } from 'echarts/charts'
import { DataZoomComponent, GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ECharts } from 'echarts/core'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useGameStore } from '@/stores/game'
import { fmt } from '@/utils/format'

echarts.use([CandlestickChart, LineChart, BarChart, GridComponent, TooltipComponent, DataZoomComponent, CanvasRenderer])

const store = useGameStore()
const el = ref<HTMLDivElement | null>(null)
let chart: ECharts | null = null
let observer: ResizeObserver | null = null

function ma(values: number[], n: number): (number | null)[] {
  return values.map((_, i) => (i < n - 1 ? null : values.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0) / n))
}

function render(): void {
  if (!chart) return
  const s = store.selectedStock
  const candles = s.candles.slice(-45)
  const dates = candles.map((c) => c.date)
  const ohlc = candles.map((c) => [c.open, c.close, c.low, c.high])
  const closes = candles.map((c) => c.close)
  const volumes = candles.map((c) => ({
    value: c.volume,
    itemStyle: { color: c.close >= c.open ? 'rgba(255,91,91,.65)' : 'rgba(32,201,139,.65)' }
  }))
  chart.setOption({
    animation: false,
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: 'rgba(12,20,34,.96)',
      borderColor: '#2b3b58',
      textStyle: { color: '#e6edf7', fontSize: 11 },
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number }[]
        if (!arr?.length) return ''
        const i = arr[0].dataIndex
        const c = candles[i]
        const col = c.close >= c.open ? '#ff5b5b' : '#20c98b'
        return `<div style="min-width:150px"><b>${c.date}</b><br/>开 <b style="color:${col}">${c.open.toFixed(2)}</b> 高 ${c.high.toFixed(2)}<br/>低 ${c.low.toFixed(2)} 收 <b style="color:${col}">${c.close.toFixed(2)}</b><br/>量 ${c.volume} 万手</div>`
      }
    },
    grid: [
      { left: 58, right: 18, top: 18, height: '62%' },
      { left: 58, right: 18, top: '80%', height: '14%' }
    ],
    xAxis: [
      { type: 'category', data: dates, gridIndex: 0, axisLabel: { show: false }, axisLine: { lineStyle: { color: '#2b3b58' } }, axisTick: { show: false } },
      { type: 'category', data: dates, gridIndex: 1, axisLabel: { color: '#6f7f9a', fontSize: 9, interval: 8 }, axisLine: { lineStyle: { color: '#2b3b58' } }, axisTick: { show: false } }
    ],
    yAxis: [
      { scale: true, gridIndex: 0, splitLine: { lineStyle: { color: 'rgba(43,59,88,.45)' } }, axisLabel: { color: '#6f7f9a', fontSize: 10 } },
      { scale: true, gridIndex: 1, splitNumber: 2, axisLabel: { show: false }, splitLine: { show: false } }
    ],
    dataZoom: [{ type: 'inside', xAxisIndex: [0, 1], start: 0, end: 100 }],
    series: [
      {
        type: 'candlestick', data: ohlc, xAxisIndex: 0, yAxisIndex: 0,
        itemStyle: { color: '#ff5b5b', color0: '#20c98b', borderColor: '#ff5b5b', borderColor0: '#20c98b' }
      },
      { type: 'line', data: ma(closes, 5), xAxisIndex: 0, yAxisIndex: 0, smooth: true, showSymbol: false, lineStyle: { width: 1.2, color: '#f7c948' }, name: 'MA5' },
      { type: 'line', data: ma(closes, 10), xAxisIndex: 0, yAxisIndex: 0, smooth: true, showSymbol: false, lineStyle: { width: 1.2, color: '#4d9dff' }, name: 'MA10' },
      { type: 'line', data: ma(closes, 20), xAxisIndex: 0, yAxisIndex: 0, smooth: true, showSymbol: false, lineStyle: { width: 1.2, color: '#a67cff' }, name: 'MA20' },
      { type: 'bar', data: volumes, xAxisIndex: 1, yAxisIndex: 1 }
    ]
  }, true)

}

onMounted(() => {
  if (!el.value) return
  chart = echarts.init(el.value)
  observer = new ResizeObserver(() => chart?.resize())
  observer.observe(el.value)
  render()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  chart?.dispose()
})

watch(() => [store.selectedCode, store.day], render)
</script>

<template>
  <section class="panel chart-panel">
    <div class="head">
      <div class="title">
        <b>{{ store.selectedStock.name }}</b>
        <span>{{ store.selectedStock.code }}</span>
        <span class="concept">{{ store.selectedStock.concept }}</span>
        <span v-if="store.selectedStock.memeTag" class="tag">{{ store.selectedStock.memeTag }}</span>
      </div>
      <div class="price" :class="store.selectedStock.price >= store.selectedStock.prevClose ? 'up' : 'down'">
        <b :key="store.selectedStock.price" class="price-flash">{{ fmt(store.selectedStock.price) }}</b>
        <small>{{ ((store.selectedStock.price - store.selectedStock.prevClose) / store.selectedStock.prevClose * 100).toFixed(2) }}%</small>
      </div>
    </div>
    <div ref="el" class="canvas" />
    <div class="foot">
      <span><i class="dot ma5" />MA5</span>
      <span><i class="dot ma10" />MA10</span>
      <span><i class="dot ma20" />MA20</span>
      <span class="muted">主力：{{ store.selectedStock.controller }}</span>
    </div>
  </section>
</template>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid var(--line); flex: none; }
.title { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.title b { font-size: 15px; }
.title span { color: var(--muted); font-size: 11px; }
.concept, .tag { color: var(--gold) !important; border: 1px solid rgba(247, 201, 72, .35); border-radius: 5px; padding: 2px 6px; }
.price { display: flex; align-items: baseline; gap: 8px; }
.price b { font-size: 20px; }
.price small { font-size: 12px; }
.canvas { flex: 1; min-height: 220px; width: 100%; }
.foot { flex: none; display: flex; gap: 14px; padding: 8px 14px; border-top: 1px solid var(--line); font-size: 10px; color: var(--muted); }
.dot { display: inline-block; width: 8px; height: 2px; vertical-align: middle; margin-right: 4px; }
.ma5 { background: var(--gold); }
.ma10 { background: var(--blue); }
.ma20 { background: var(--purple); }
</style>
