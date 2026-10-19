import type { Adjacency } from './graph'

export type Turn = 'cop' | 'robber'
export interface StateInfo {
  copWins: boolean
  movesToCapture?: number
}

export interface Solution {
  adj: Adjacency
  allowStay: boolean
  get(cop: string, robber: string, turn: Turn): StateInfo
}

/** Coups possibles depuis un sommet (voisins, plus rester sur place si permis). */
export function movesFrom(adj: Adjacency, v: string, allowStay: boolean): string[] {
  return allowStay ? [v, ...adj[v]] : [...adj[v]]
}

/** Analyse rétrograde : valeur = nombre total de coups jusqu'à la capture. */
export function solve(adj: Adjacency, allowStay: boolean): Solution {
  const ids = Object.keys(adj)
  const n = ids.length
  const idx = new Map(ids.map((id, i) => [id, i]))
  const nb = ids.map((id) => movesFrom(adj, id, allowStay).map((m) => idx.get(m)!))
  const key = (t: number, c: number, r: number) => (t * n + c) * n + r // t: 0 policier, 1 voleur
  const val = new Array<number>(2 * n * n).fill(-1)

  for (let t = 0; t < 2; t++) for (let c = 0; c < n; c++) val[key(t, c, c)] = 0

  for (let level = 1, changed = true; changed; level++) {
    changed = false
    const found: number[] = []
    for (let c = 0; c < n; c++) {
      for (let r = 0; r < n; r++) {
        if (c === r) continue
        // Tour du policier : un coup vers un état gagné au niveau précédent
        if (val[key(0, c, r)] < 0 && nb[c].some((c2) => { const v = val[key(1, c2, r)]; return v >= 0 && v === level - 1 })) {
          found.push(key(0, c, r))
        }
        // Tour du voleur : tous ses coups mènent à un état gagné pour le policier
        if (val[key(1, c, r)] < 0 && nb[r].every((r2) => val[key(0, c, r2)] >= 0)) {
          found.push(key(1, c, r))
        }
      }
    }
    for (const k of found) { val[k] = level; changed = true }
  }

  return {
    adj,
    allowStay,
    get(cop, robber, turn) {
      const v = val[key(turn === 'cop' ? 0 : 1, idx.get(cop)!, idx.get(robber)!)]
      return v >= 0 ? { copWins: true, movesToCapture: v } : { copWins: false }
    },
  }
}

export function bfsDistance(adj: Adjacency, from: string, to: string): number {
  if (from === to) return 0
  const seen = new Set([from])
  let frontier = [from]
  for (let d = 1; frontier.length; d++) {
    const next: string[] = []
    for (const v of frontier) {
      for (const w of adj[v]) {
        if (seen.has(w)) continue
        if (w === to) return d
        seen.add(w)
        next.push(w)
      }
    }
    frontier = next
  }
  return Infinity
}

const stateValue = (s: Solution, cop: string, robber: string, turn: Turn) =>
  cop === robber ? 0 : s.get(cop, robber, turn).movesToCapture ?? Infinity

/** Réponses sûres du voleur (policier en `cop`, voleur en `robber`, tour du voleur). */
function safeReplies(s: Solution, cop: string, robber: string): number {
  return movesFrom(s.adj, robber, s.allowStay)
    .filter((r) => r !== cop && !s.get(cop, r, 'cop').copWins).length
}

/**
 * Meilleur coup du policier (position inchangée possible si rester est permis).
 * Hors état gagnant : minimise les réponses sûres du voleur, puis la distance BFS,
 * puis tire au hasard (rng) parmi les égalités.
 */
export function bestCopMove(s: Solution, cop: string, robber: string, rng: () => number = Math.random): string {
  const moves = movesFrom(s.adj, cop, s.allowStay)
  if (s.get(cop, robber, 'cop').copWins) {
    return moves.reduce((best, m) =>
      stateValue(s, m, robber, 'robber') < stateValue(s, best, robber, 'robber') ? m : best)
  }
  const score = (m: string) => [m === robber ? 0 : safeReplies(s, m, robber), bfsDistance(s.adj, m, robber)]
  const scored = moves.map((m) => ({ m, sc: score(m) }))
  const better = (a: number[], b: number[]) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1])
  let bestSc = scored[0].sc
  for (const x of scored) if (better(x.sc, bestSc)) bestSc = x.sc
  const ties = scored.filter((x) => x.sc[0] === bestSc[0] && x.sc[1] === bestSc[1])
  return ties[Math.min(ties.length - 1, Math.floor(rng() * ties.length))].m
}

/** Clé d’un état complet (pour détecter les répétitions de position). */
export const stateKey = (cop: string, robber: string, turn: Turn) => `${cop}|${robber}|${turn}`

/**
 * Choix stratégique (pas une nécessité logique) : parmi les coups sûrs,
 * lequel jouer ? Par défaut, on maximise la distance BFS au policier.
 */
export function chooseSafeRobberMove(safeMoves: string[], cop: string, adj: Adjacency): string {
  return safeMoves.reduce((best, m) =>
    bfsDistance(adj, cop, m) > bfsDistance(adj, cop, best) ? m : best)
}

/** Meilleur coup du voleur. */
export function bestRobberMove(s: Solution, cop: string, robber: string): string {
  const moves = movesFrom(s.adj, robber, s.allowStay)
  if (s.get(cop, robber, 'robber').copWins) {
    return moves.reduce((best, m) =>
      stateValue(s, cop, m, 'cop') > stateValue(s, cop, best, 'cop') ? m : best)
  }
  const safe = moves.filter((m) => m !== cop && !s.get(cop, m, 'cop').copWins)
  return chooseSafeRobberMove(safe, cop, s.adj)
}

export interface DismantleResult {
  copWin: boolean
  order: string[] // coins retirés, dans l'ordre
  core: string[] // sommets restants (vide si le graphe est démontable)
}

/** Un graphe est « cop-win » ssi on peut le réduire à un sommet en retirant des coins. */
export function isCopWinGraph(adj: Adjacency): DismantleResult {
  const remaining = new Set(Object.keys(adj))
  const closed = (v: string) => new Set([v, ...adj[v].filter((w) => remaining.has(w))])
  const order: string[] = []
  let removed = true
  while (removed && remaining.size > 1) {
    removed = false
    for (const v of remaining) {
      const nv = closed(v)
      const isCorner = [...remaining].some((u) => u !== v && [...nv].every((x) => closed(u).has(x)))
      if (isCorner) {
        remaining.delete(v)
        order.push(v)
        removed = true
        break
      }
    }
  }
  return { copWin: remaining.size <= 1, order, core: remaining.size <= 1 ? [] : [...remaining] }
}

/** Premier triangle (cycle impair de longueur 3) trouvé, ou null. */
export function findTriangle(adj: Adjacency): string[] | null {
  for (const a of Object.keys(adj))
    for (const b of adj[a]) if (b > a)
      for (const c of adj[b]) if (c > b && adj[a].includes(c)) return [a, b, c]
  return null
}
