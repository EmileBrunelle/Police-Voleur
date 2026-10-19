<script setup lang="ts">
import { Switch } from '@vuetify/v0'
import { computed } from 'vue'
import type { StateInfo } from '../solver'

const props = defineProps<{ allowStay: boolean; startInfo: StateInfo; triangle: string[] | null; caught: boolean; escaped: boolean; info: StateInfo; repeatCount: number; core: string[]; order: string[]; showDanger: boolean }>()
defineEmits<{ 'update:showDanger': [v: boolean] }>()

const coups = (n: number) => `${n} coup${n > 1 ? 's' : ''}`
const verdict = computed(() => {
  if (props.caught) return 'Capturé !'
  if (props.escaped) return 'Le voleur s’échappe — position répétée 3 fois.'
  return props.info.copWins
    ? `Le policier attrape le voleur en ${coups(props.info.movesToCapture ?? 0)} au maximum`
    : 'Le voleur peut s’échapper indéfiniment'
})
const tri = computed(() => props.triangle?.join('-') ?? '')
</script>

<template>
  <section class="rounded-xl bg-slate-800/70 p-4 space-y-4">
    <h2 class="text-lg font-semibold">Analyse</h2>
    <p :class="caught || info.copWins ? 'text-blue-300' : 'text-orange-300'" class="font-medium">{{ verdict }}</p>
    <p v-if="repeatCount >= 2" class="text-xs text-slate-400">Position vue {{ repeatCount }}/3 fois</p>
    <Switch.Root :model-value="showDanger" class="switch-label"
      @update:model-value="$emit('update:showDanger', !!$event)">
      <Switch.Track class="switch-track">
        <Switch.Thumb class="switch-thumb" />
      </Switch.Track>
      Carte de danger
    </Switch.Root>
    <p v-if="showDanger" class="text-sm text-slate-400">
      Rouge : capture forcée (nombre de coups). Vert : le voleur serait en sécurité s’il se tenait là,
      le policier jouant en premier depuis sa position actuelle.
    </p>
    <div v-if="allowStay" class="rounded-lg bg-slate-900/60 p-3 text-sm text-slate-300 space-y-2">
      <p class="font-semibold text-slate-100">Pourquoi le policier ne gagne pas toujours</p>
      <p>
        Le graphe n’est pas « gagnant pour le policier » : après avoir retiré le coin
        <strong>{{ order.join(', ') }}</strong>, les {{ core.length }} sommets restants
        ({{ core.join(', ') }}) se trouvent tous sur un carré (A-B-F-I, B-C-G-F, C-D-H-G, D-E-K-H) sans
        voisin dominant. Le voleur peut donc toujours passer au coin opposé du carré.
      </p>
      <p>Le triangle H-J-K est le seul piège : s’y réfugier, c’est se faire coincer.</p>
    </div>
    <div v-else-if="startInfo.copWins" class="rounded-lg bg-slate-900/60 p-3 text-sm text-slate-300 space-y-2">
      <p class="font-semibold text-slate-100">Pourquoi le policier peut gagner</p>
      <p>
        Sans le droit de rester sur place, le voleur doit bouger à chaque tour. Sur un graphe qui n’a que des
        cycles pairs (carrés), le voleur pourrait conserver indéfiniment la même parité de distance avec le policier.
      </p>
      <p v-if="triangle">
        Le triangle <strong>{{ tri }}</strong> est un cycle impair : le policier s’y sert pour changer de parité,
        puis coince le voleur. Par exemple, voleur en A et policier en F avec le voleur à jouer : il doit aller en B ou
        en I, deux voisins de F.
      </p>
      <p>Capture forcée en {{ coups(startInfo.movesToCapture ?? 0) }} au maximum avec un jeu parfait depuis le départ.</p>
    </div>
    <div v-else class="rounded-lg bg-slate-900/60 p-3 text-sm text-slate-300 space-y-2">
      <p class="font-semibold text-slate-100">Analyse de la règle sans rester sur place</p>
      <p>Depuis la position de départ, le policier ne peut pas forcer la capture : le voleur peut s’échapper indéfiniment.</p>
    </div>
  </section>
</template>
