import type * as d3 from 'd3'

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string
  label: string
  group: 'post' | 'tag'
  category?: string
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode
  target: string | GraphNode
}
