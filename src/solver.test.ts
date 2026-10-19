import { describe, expect, it } from 'vitest'
import { adjacency, buildAdjacency, nodes } from './graph'
import { bestCopMove, findTriangle, isCopWinGraph, movesFrom, solve, stateKey } from './solver'

const path = buildAdjacency(['1', '2', '3', '4', '5'], [['1', '2'], ['2', '3'], ['3', '4'], ['4', '5']])

describe('solve', () => {
  it('le policier ne gagne pas sur le graphe par défaut', () => {
    expect(solve(adjacency, true).get('F', 'A', 'cop').copWins).toBe(false)
  })
  it('policier en H, voleur en J : capture en 1 coup', () => {
    expect(solve(adjacency, true).get('H', 'J', 'cop')).toEqual({ copWins: true, movesToCapture: 1 })
  })
  it('le policier gagne depuis tous les états sur un chemin', () => {
    const s = solve(path, true)
    for (const c of Object.keys(path)) for (const r of Object.keys(path))
      for (const t of ['cop', 'robber'] as const) expect(s.get(c, r, t).copWins).toBe(true)
  })
})

describe('isCopWinGraph', () => {
  it('graphe par défaut : non démontable, J retiré, noyau de 10 sommets', () => {
    const res = isCopWinGraph(adjacency)
    expect(res.copWin).toBe(false)
    expect(res.order).toEqual(['J'])
    expect(res.core.sort()).toEqual(nodes.map((n) => n.id).filter((id) => id !== 'J').sort())
  })
  it('chemin : démontable', () => {
    expect(isCopWinGraph(path).copWin).toBe(true)
  })
})

describe('bestCopMove hors état gagnant', () => {
  it('renvoie un coup légal avec un rng déterministe', () => {
    const s = solve(adjacency, true)
    expect(s.get('F', 'A', 'cop').copWins).toBe(false)
    let seed = 7
    const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647
    const m = bestCopMove(s, 'F', 'A', rng)
    expect(movesFrom(adjacency, 'F', true)).toContain(m)
  })
  it('stateKey distingue le tour', () => {
    expect(stateKey('A', 'B', 'cop')).not.toBe(stateKey('A', 'B', 'robber'))
  })
})

describe('sans rester sur place', () => {
  const s = solve(adjacency, false)
  it('policier F, voleur A, policier joue : le policier gagne', () => {
    const r = s.get('F', 'A', 'cop')
    console.log('N (F, A, cop, sans rester) =', r.movesToCapture)
    expect(r.copWins).toBe(true)
  })
  it('policier F, voleur A, voleur joue : capture forcée (2 demi-coups : le voleur bouge, le policier capture)', () => {
    expect(s.get('F', 'A', 'robber')).toEqual({ copWins: true, movesToCapture: 2 })
  })
  it('triangle H-J-K détecté', () => {
    expect(findTriangle(adjacency)).toEqual(['H', 'J', 'K'])
  })
})
