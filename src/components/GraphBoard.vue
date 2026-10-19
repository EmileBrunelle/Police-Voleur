<script setup lang="ts">
import { computed } from 'vue'
import { edges, nodes } from '../graph'

const props = defineProps<{
  cop: string
  robber: string
  legal: string[]
  danger: Record<string, { copWins: boolean; n?: number }>
  showDanger: boolean
  placing: boolean
}>()
defineEmits<{ select: [id: string] }>()

const pos = Object.fromEntries(nodes.map((n) => [n.id, n]))
const together = computed(() => props.cop === props.robber)
const tokenPos = (id: string, dx: number) => {
  const p = pos[id]
  return { transform: `translate(${p.x + (together.value ? dx : 0)}px, ${p.y + (together.value ? 0 : 0)}px)` }
}
const R = 26
const MARGIN = 56
const xs = nodes.map((n) => n.x)
const ys = nodes.map((n) => n.y)
const vbX = Math.min(...xs) - MARGIN
const vbY = Math.min(...ys) - MARGIN
const viewBox = `${vbX} ${vbY} ${Math.max(...xs) + MARGIN - vbX} ${Math.max(...ys) + MARGIN - vbY}`
const fill = (id: string) => {
  if (!props.showDanger) return '#1e293b'
  return props.danger[id].copWins ? '#7f1d1d' : '#14532d'
}
const stroke = (id: string) => {
  if (!props.showDanger) return '#64748b'
  return props.danger[id].copWins ? '#f87171' : '#4ade80'
}
</script>

<template>
  <svg :viewBox="viewBox" class="w-full h-auto select-none" role="img" aria-label="Graphe du jeu">
    <line v-for="[a, b] in edges" :key="a + b" :x1="pos[a].x" :y1="pos[a].y" :x2="pos[b].x" :y2="pos[b].y"
      stroke="#475569" stroke-width="4" stroke-linecap="round" />
    <g v-for="n in nodes" :key="n.id" class="cursor-pointer" @click="$emit('select', n.id)">
      <circle v-if="legal.includes(n.id) || placing" :cx="n.x" :cy="n.y" :r="R + 4" fill="none"
        :stroke="placing ? '#facc15' : '#38bdf8'" stroke-width="3" class="pulse" />
      <circle :cx="n.x" :cy="n.y" :r="R" :fill="fill(n.id)" :stroke="stroke(n.id)" stroke-width="3" />
      <text :x="n.x" :y="n.y" text-anchor="middle" dominant-baseline="central" font-size="22" font-weight="700" fill="#e2e8f0" class="lbl"
        pointer-events="none">{{ n.id }}</text>
      <text v-if="showDanger && danger[n.id].copWins" :x="n.x" :y="n.y + 46" text-anchor="middle" font-size="15"
        fill="#fca5a5" pointer-events="none">{{ danger[n.id].n }}</text>
    </g>
    <g class="token" :style="tokenPos(cop, -14)" pointer-events="none">
      <circle r="21" fill="#2563eb" stroke="#93c5fd" stroke-width="2.5" />
      <text text-anchor="middle" dominant-baseline="central" font-size="26" class="emo">👮</text>
    </g>
    <g class="token" :style="tokenPos(robber, 14)" pointer-events="none">
      <circle r="21" fill="#ea580c" stroke="#fdba74" stroke-width="2.5" />
      <text text-anchor="middle" dominant-baseline="central" font-size="26" class="emo">🦹</text>
    </g>
  </svg>
</template>

<style scoped>
.lbl { font-size: 22px; line-height: 1; }
.emo { font-size: 26px; line-height: 1; }
.token { transition: transform 400ms ease-in-out; }
.pulse { animation: pulse 1.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes pulse {
  0%, 100% { opacity: 0.35; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.12); }
}
</style>
