export interface GraphNode {
  id: string
  x: number
  y: number
}

export type Adjacency = Record<string, string[]>

export const nodes: GraphNode[] = [
  { id: 'A', x: 60, y: 90 },
  { id: 'B', x: 220, y: 70 },
  { id: 'C', x: 400, y: 55 },
  { id: 'D', x: 580, y: 40 },
  { id: 'E', x: 760, y: 25 },
  { id: 'I', x: 90, y: 250 },
  { id: 'F', x: 260, y: 230 },
  { id: 'G', x: 420, y: 215 },
  { id: 'H', x: 600, y: 200 },
  { id: 'J', x: 620, y: 350 },
  { id: 'K', x: 780, y: 340 },
]

export const edges: [string, string][] = [
  ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'],
  ['A', 'I'], ['I', 'F'], ['B', 'F'], ['F', 'G'], ['C', 'G'],
  ['G', 'H'], ['D', 'H'], ['H', 'J'], ['H', 'K'], ['J', 'K'], ['E', 'K'],
]

export const defaultStart = { cop: 'F', robber: 'A' }

export function buildAdjacency(ids: string[], edgeList: [string, string][]): Adjacency {
  const adj: Adjacency = {}
  for (const id of ids) adj[id] = []
  for (const [a, b] of edgeList) {
    adj[a].push(b)
    adj[b].push(a)
  }
  return adj
}

export const adjacency: Adjacency = buildAdjacency(nodes.map((n) => n.id), edges)
