<script setup lang="ts">
import { Button, Radio, Switch } from '@vuetify/v0'
import AnalysisPanel from './components/AnalysisPanel.vue'
import GraphBoard from './components/GraphBoard.vue'
import { roleLabel, useGame, type Mode } from './useGame'

const g = useGame()
const modes: { id: Mode; label: string }[] = [
  { id: 'robber', label: 'Je suis le voleur' },
  { id: 'cop', label: 'Je suis le policier' },
  { id: 'ai', label: 'IA contre IA' },
]
</script>

<template>
  <main class="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
    <div class="max-w-6xl mx-auto space-y-4">
      <header>
        <h1 class="text-2xl md:text-3xl font-bold">Policier et voleur 👮🦹</h1>
        <p class="text-slate-400 text-sm">Le policier joue en premier. À chaque tour, on se déplace vers un sommet voisin.</p>
      </header>

      <div class="flex flex-wrap gap-3 items-center">
        <Radio.Group v-model="g.mode.value" aria-label="Mode de jeu" class="inline-flex rounded-lg bg-slate-800 p-1">
          <Radio.Root v-for="m in modes" :key="m.id" :value="m.id"
            class="seg-item">
            {{ m.label }}
          </Radio.Root>
        </Radio.Group>
        <Switch.Root v-model="g.allowStay.value" class="switch-label">
          <Switch.Track class="switch-track">
            <Switch.Thumb class="switch-thumb" />
          </Switch.Track>
          Rester sur place permis
        </Switch.Root>
        <Button.Root class="btn" @click="g.startPlacing()">Placer</Button.Root>
        <Button.Root class="btn" @click="g.restart()">Recommencer</Button.Root>
        <Button.Root v-if="!g.started.value" class="btn" :disabled="g.placing.value" @click="g.start()">Commencer</Button.Root>
        <template v-if="g.mode.value === 'ai' && g.started.value">
          <Button.Root class="btn" :disabled="g.caught.value || g.escaped.value || g.placing.value" @click="g.playing.value = !g.playing.value">
            {{ g.playing.value ? 'Pause' : 'Lecture' }}
          </Button.Root>
          <Button.Root class="btn" :disabled="g.caught.value || g.escaped.value || g.placing.value || g.playing.value" @click="g.aiMove()">Pas à pas</Button.Root>
        </template>
      </div>

      <div class="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div class="space-y-3 min-w-0">
          <div class="rounded-xl bg-slate-800/70 p-3">
            <p v-if="g.placing.value" class="text-yellow-300 font-medium mb-2">
              Placer : cliquez un sommet pour le {{ g.placeStep.value === 'cop' ? 'policier 👮' : 'voleur 🦹' }}.
            </p>
            <p v-else-if="g.caught.value" class="mb-2 rounded-lg bg-emerald-700 px-3 py-2 font-semibold" role="status">
              Capturé ! Le policier a attrapé le voleur en {{ g.history.value.length }} coup{{ g.history.value.length > 1 ? 's' : '' }}.
            </p>
            <p v-else-if="g.escaped.value" class="mb-2 rounded-lg bg-amber-700 px-3 py-2 font-semibold" role="status">
              Le voleur s’échappe — position répétée 3 fois.
              <span class="block font-normal text-sm mt-1">Avec un seul policier, ce graphe ne permet pas de capture forcée : le voleur peut tourner indéfiniment sur un carré.</span>
            </p>
            <p v-else class="mb-2 text-sm text-slate-300">
              Tour : <strong>{{ roleLabel[g.turn.value] }}</strong>
              <span class="text-slate-500"> · Coups joués : {{ g.history.value.length }}</span>
              <span v-if="g.humanTurn.value" class="text-sky-300"> · À vous de jouer</span>
            </p>
            <GraphBoard :cop="g.cop.value" :robber="g.robber.value" :legal="g.humanTurn.value ? g.legalMoves.value : []"
              :danger="g.dangerMap.value" :show-danger="g.showDanger.value" :placing="g.placing.value"
              @select="g.clickNode" />
          </div>
          <section class="rounded-xl bg-slate-800/70 p-4">
            <h2 class="text-lg font-semibold mb-2">Historique</h2>
            <p v-if="!g.history.value.length" class="text-sm text-slate-500">Aucun coup joué.</p>
            <ol class="text-sm space-y-0.5 max-h-48 overflow-y-auto">
              <li v-for="h in [...g.history.value].reverse()" :key="h.n">
                {{ h.n }}. {{ roleLabel[h.who] }}
                <template v-if="h.from === h.to">reste en {{ h.to }}</template>
                <template v-else>{{ h.from }} → {{ h.to }}</template>
              </li>
            </ol>
          </section>
        </div>
        <AnalysisPanel :allow-stay="g.allowStay.value" :start-info="g.startInfo.value" :triangle="g.triangle" :caught="g.caught.value" :escaped="g.escaped.value"
          :info="g.info.value" :repeat-count="g.repeatCount.value" :core="g.dismantle.core" :order="g.dismantle.order"
          v-model:show-danger="g.showDanger.value" />
      </div>
    </div>
  </main>
</template>

<style>
html { color-scheme: dark; }
body { margin: 0; font-family: system-ui, sans-serif; background: #0f172a; }
</style>
