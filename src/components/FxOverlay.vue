<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useGameStore } from '@/stores/game'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

const store = useGameStore()
const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let particles: Particle[] = []
let raf = 0
let shakeTimer = 0

function burst(cx: number, cy: number, colors: string[], count: number, power: number): void {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3
    const speed = (2.2 + Math.random() * 5.5) * power
    const life = 45 + Math.floor(Math.random() * 40)
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      life,
      maxLife: life,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 1.8 + Math.random() * 3.2
    })
  }
  if (particles.length > 700) particles = particles.slice(-700)
}

function loop(): void {
  if (!ctx) return
  const c = canvas.value
  if (!c) return
  ctx.clearRect(0, 0, c.width, c.height)
  particles = particles.filter((p) => p.life > 0)
  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.055
    p.vx *= 0.994
    p.life -= 1
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife)
    ctx.fillStyle = p.color
    ctx.shadowBlur = 12
    ctx.shadowColor = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  ctx.shadowBlur = 0
  raf = particles.length ? requestAnimationFrame(loop) : 0
}

function shake(cls: string, ms: number): void {
  const el = document.querySelector('.app-shell')
  if (!el) return
  el.classList.remove('shake-buy', 'shake-sell', 'shake-big')
  void (el as HTMLElement).offsetWidth
  el.classList.add(cls)
  window.clearTimeout(shakeTimer)
  shakeTimer = window.setTimeout(() => el.classList.remove(cls), ms)
}

function play(type: string): void {
  const c = canvas.value
  if (!c) return
  const w = c.width
  const h = c.height
  if (type === 'buy') {
    burst(w / 2, h / 2, ['#ff5b5b', '#ff9f43', '#f7c948', '#ffffff'], 130, 1.25)
    shake('shake-buy', 430)
  } else if (type === 'sell') {
    burst(w / 2, h / 2, ['#20c98b', '#4d9dff', '#ffffff'], 100, 1.05)
    shake('shake-sell', 380)
  } else if (type === 'dividend') {
    burst(w * 0.28, h * 0.34, ['#f7c948', '#ff9f43', '#ffffff'], 130, 1.35)
    burst(w * 0.72, h * 0.4, ['#f7c948', '#ff5b5b', '#ffffff'], 130, 1.35)
    burst(w * 0.5, h * 0.62, ['#f7c948', '#20c98b', '#ffffff'], 130, 1.2)
    shake('shake-big', 680)
  } else if (type === 'limitup') {
    burst(w * 0.5, h * 0.26, ['#ff5b5b', '#ff9f43'], 55, 0.85)
  }
  if (!raf) raf = requestAnimationFrame(loop)
}

function resize(): void {
  const c = canvas.value
  if (!c) return
  c.width = window.innerWidth
  c.height = window.innerHeight
}

watch(() => store.fxSignal, () => play(store.fxType))

onMounted(() => {
  const c = canvas.value
  if (!c) return
  ctx = c.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  if (raf) cancelAnimationFrame(raf)
  window.clearTimeout(shakeTimer)
})
</script>

<template>
  <canvas ref="canvas" class="fx-canvas" aria-hidden="true" />
</template>

<style scoped>
.fx-canvas {
  position: fixed; inset: 0; width: 100%; height: 100%;
  pointer-events: none; z-index: 95;
}
</style>
