import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { adjacency, defaultStart } from './graph'
import { bestCopMove, bestRobberMove, findTriangle, isCopWinGraph, movesFrom, solve, stateKey, type Turn } from './solver'

export type Mode = 'robber' | 'cop' | 'ai'
export interface HistoryEntry {
  n: number
  who: Turn
  from: string
  to: string
}

export const MAX_REPEATS = 3

export const roleLabel: Record<Turn, string> = { cop: 'Policier', robber: 'Voleur' }

export function useGame() {
  const cop = ref(defaultStart.cop)
  const robber = ref(defaultStart.robber)
  const turn = ref<Turn>('cop')
  const history = ref<HistoryEntry[]>([])
  const mode = ref<Mode>('robber')
  const allowStay = ref(false)
  const placing = ref(false)
  const placeStep = ref<Turn>('cop')
  const playing = ref(false)
  const showDanger = ref(false)
  const seen = ref<Record<string, number>>({ [stateKey(defaultStart.cop, defaultStart.robber, 'cop')]: 1 })
  const escaped = ref(false)
  const started = ref(false)

  const solutions = reactive({
    stay: solve(adjacency, true),
    noStay: solve(adjacency, false),
  })
  const solution = computed(() => (allowStay.value ? solutions.stay : solutions.noStay))
  const dismantle = isCopWinGraph(adjacency)
  const startInfo = computed(() => solution.value.get(defaultStart.cop, defaultStart.robber, 'cop'))
  const triangle = findTriangle(adjacency)

  const caught = computed(() => cop.value === robber.value)
  const info = computed(() => solution.value.get(cop.value, robber.value, turn.value))
  const dangerMap = computed(() => {
    const map: Record<string, { copWins: boolean; n?: number }> = {}
    for (const id of Object.keys(adjacency)) {
      const r = id === cop.value ? { copWins: true, movesToCapture: 0 } : solution.value.get(cop.value, id, 'cop')
      map[id] = { copWins: r.copWins, n: r.movesToCapture }
    }
    return map
  })

  const repeatCount = computed(() => seen.value[stateKey(cop.value, robber.value, turn.value)] ?? 1)

  const humanTurn = computed(() => escaped.value ? false : mode.value === 'ai' ? false : (mode.value === 'robber' ? turn.value === 'robber' : turn.value === 'cop'))
  const legalMoves = computed(() => {
    if (caught.value || escaped.value || placing.value) return []
    const from = turn.value === 'cop' ? cop.value : robber.value
    return movesFrom(adjacency, from, allowStay.value)
  })

  function play(to: string) {
    if (caught.value || escaped.value) return
    const who = turn.value
    const from = who === 'cop' ? cop.value : robber.value
    if (who === 'cop') cop.value = to
    else robber.value = to
    history.value.push({ n: history.value.length + 1, who, from, to })
    turn.value = who === 'cop' ? 'robber' : 'cop'
    const k = stateKey(cop.value, robber.value, turn.value)
    const n = (seen.value[k] ?? 0) + 1
    seen.value[k] = n
    if (n >= MAX_REPEATS && !caught.value) {
      escaped.value = true
      playing.value = false
    }
  }

  function aiMove() {
    if (caught.value || escaped.value || placing.value) return
    started.value = true
    play(turn.value === 'cop'
      ? bestCopMove(solution.value, cop.value, robber.value, Math.random)
      : bestRobberMove(solution.value, cop.value, robber.value))
  }

  function clickNode(id: string) {
    if (placing.value) {
      if (placeStep.value === 'cop') {
        cop.value = id
        placeStep.value = 'robber'
      } else {
        robber.value = id
        placing.value = false
        resetPlay()
      }
      return
    }
    if (humanTurn.value && legalMoves.value.includes(id)) {
      started.value = true
      play(id)
    }
  }

  function resetPlay() {
    history.value = []
    turn.value = 'cop'
    playing.value = false
    escaped.value = false
    started.value = false
    seen.value = { [stateKey(cop.value, robber.value, 'cop')]: 1 }
  }

  function restart() {
    cop.value = defaultStart.cop
    robber.value = defaultStart.robber
    placing.value = false
    resetPlay()
  }

  function start() {
    if (placing.value || caught.value || escaped.value) return
    started.value = true
    if (mode.value === 'ai') playing.value = true
  }

  function startPlacing() {
    placing.value = true
    placeStep.value = 'cop'
    playing.value = false
  }

  // L'IA joue après un délai, pour laisser l'animation se terminer
  let timer: ReturnType<typeof setTimeout> | undefined
  watch([cop, robber, turn, mode, playing, placing, allowStay, escaped, started], () => {
    clearTimeout(timer)
    if (caught.value || escaped.value || placing.value) return
    if (!started.value) return
    const aiTurn = mode.value === 'ai' ? playing.value : !humanTurn.value
    if (aiTurn) timer = setTimeout(aiMove, mode.value === 'ai' ? 800 : 650)
  })
  watch(caught, (c) => { if (c) playing.value = false })
  watch([mode, allowStay], resetPlay)
  onBeforeUnmount(() => clearTimeout(timer))

  return {
    cop, robber, turn, history, mode, allowStay, placing, placeStep, playing, showDanger,
    dismantle, startInfo, triangle, started, caught, escaped, repeatCount, info, dangerMap, humanTurn, legalMoves,
    clickNode, start, restart, startPlacing, aiMove,
  }
}
