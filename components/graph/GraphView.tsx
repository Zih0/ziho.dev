'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import type * as d3Types from 'd3'
import type { Post } from '@/types/post'
import type { GraphNode, GraphLink } from '@/types/graph'
import { PostPreviewDrawer } from './PostPreviewDrawer'

interface GraphViewProps {
  posts: Post[]
  initialNodes: GraphNode[]
  initialLinks: GraphLink[]
}

export function GraphView({ posts, initialNodes, initialLinks }: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const simulationRef = useRef<d3Types.Simulation<GraphNode, undefined> | null>(null)
  const d3Ref = useRef<typeof d3Types | null>(null)
  const [isD3Loaded, setIsD3Loaded] = useState(false)

  // bundle-dynamic-imports: Load d3 dynamically as it's a heavy library
  useEffect(() => {
    import('d3').then(d3Module => {
      d3Ref.current = d3Module
      setIsD3Loaded(true)
    })
  }, [])

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'physical' | 'semantic'>('physical')
  const [gravity, setGravity] = useState(-400)
  const [linkDist, setLinkDist] = useState(120)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const categories = useMemo(() => {
    return Array.from(new Set(posts.map(p => p.category)))
  }, [posts])

  const { nodes, links } = useMemo(() => {
    if (!selectedCategory) {
      return { nodes: initialNodes, links: initialLinks }
    }

    const filteredPosts = posts.filter(p => p.category === selectedCategory)
    const filteredSlugs = new Set(filteredPosts.map(p => p.slug))

    const filteredNodes: GraphNode[] = []
    const filteredLinks: GraphLink[] = []
    const tagsSet = new Set<string>()

    filteredPosts.forEach(post => {
      filteredNodes.push({
        id: post.slug,
        label: post.title,
        group: 'post',
        category: post.category,
      })

      post.tags.forEach(tag => {
        tagsSet.add(tag)
        filteredLinks.push({ source: post.slug, target: tag })
      })
    })

    tagsSet.forEach(tag => {
      filteredNodes.push({ id: tag, label: `#${tag}`, group: 'tag' })
    })

    return { nodes: filteredNodes, links: filteredLinks }
  }, [posts, initialNodes, initialLinks, selectedCategory])

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0 || !isD3Loaded || !d3Ref.current) return

    const d3 = d3Ref.current
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    const categoryCenters: Record<string, { x: number; y: number }> = {}
    categories.forEach((cat, i) => {
      const angle = (i / categories.length) * 2 * Math.PI
      const radius = Math.min(width, height) * 0.3
      categoryCenters[cat] = {
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
      }
    })

    const svg = d3.select(svgRef.current)
    const tooltip = d3.select(tooltipRef.current)
    svg.selectAll('*').remove()

    const g = svg.append('g')

    if (viewMode === 'semantic') {
      const activeCats = selectedCategory ? [selectedCategory] : categories

      g.append('g')
        .attr('class', 'orbits')
        .selectAll('circle')
        .data(activeCats)
        .join('circle')
        .attr('cx', d => categoryCenters[d]?.x || width / 2)
        .attr('cy', d => categoryCenters[d]?.y || height / 2)
        .attr('r', 100)
        .attr('fill', 'none')
        .attr('stroke', d =>
          d === selectedCategory ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.05)'
        )
        .attr('stroke-dasharray', '4 4')
    }

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', event => g.attr('transform', event.transform))

    svg.call(zoom)

    const nodesCopy = nodes.map(n => ({ ...n }))
    const linksCopy = links.map(l => ({ ...l }))

    const simulation = d3
      .forceSimulation<GraphNode>(nodesCopy)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(linksCopy)
          .id(d => d.id)
          .distance(linkDist)
      )
      .force('charge', d3.forceManyBody().strength(gravity))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60))

    if (viewMode === 'semantic') {
      simulation.force(
        'x',
        d3
          .forceX<GraphNode>()
          .x(d => (d.category ? categoryCenters[d.category]?.x || width / 2 : width / 2))
          .strength(0.15)
      )
      simulation.force(
        'y',
        d3
          .forceY<GraphNode>()
          .y(d => (d.category ? categoryCenters[d.category]?.y || height / 2 : height / 2))
          .strength(0.15)
      )
    }

    simulationRef.current = simulation

    // Edge gradient definition for visual depth
    const defs = svg.append('defs')

    const edgeGradient = defs.append('linearGradient')
      .attr('id', 'edge-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')

    edgeGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.6)

    edgeGradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', '#60a5fa')
      .attr('stop-opacity', 0.3)

    edgeGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.6)

    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(linksCopy)
      .join('line')
      .attr('stroke', 'url(#edge-gradient)')
      .attr('stroke-width', 1.5)
      .attr('stroke-linecap', 'round')
      .style('filter', 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.3))')

    const node = g
      .append('g')
      .selectAll<SVGGElement, GraphNode>('.node')
      .data(nodesCopy)
      .join('g')
      .attr('class', 'node')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
            tooltip.style('opacity', '0')
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )
      .on('click', (event, d) => {
        event.stopPropagation()
        if (d.group === 'post') {
          const post = posts.find(p => p.slug === d.id)
          if (post) {
            setSelectedPost(post)
            setIsDrawerOpen(true)
          }
        }
      })
      .on('mouseover', (event, d) => {
        // Highlight connected edges
        link
          .attr('stroke-width', l => {
            const source = (l.source as GraphNode).id
            const target = (l.target as GraphNode).id
            return source === d.id || target === d.id ? 3 : 1.5
          })
          .attr('stroke', l => {
            const source = (l.source as GraphNode).id
            const target = (l.target as GraphNode).id
            return source === d.id || target === d.id ? '#60a5fa' : 'url(#edge-gradient)'
          })
          .style('filter', l => {
            const source = (l.source as GraphNode).id
            const target = (l.target as GraphNode).id
            return source === d.id || target === d.id
              ? 'drop-shadow(0 0 6px rgba(96, 165, 250, 0.8))'
              : 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.3))'
          })

        tooltip.style('opacity', '1').html(`
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <span class="size-1.5 rounded-full ${d.group === 'post' ? 'bg-primary' : 'bg-zinc-500'}"></span>
              <span class="font-bold uppercase tracking-wider">${d.group}</span>
            </div>
            <div class="text-white text-xs leading-tight">${d.label}</div>
            ${d.category ? `<div class="text-[8px] text-primary uppercase font-bold tracking-[0.1em] mt-0.5">${d.category}</div>` : ''}
          </div>
        `)
      })
      .on('mousemove', event => {
        tooltip
          .style('left', event.pageX + 15 + 'px')
          .style('top', event.pageY - 10 + 'px')
      })
      .on('mouseleave', () => {
        // Reset edges
        link
          .attr('stroke-width', 1.5)
          .attr('stroke', 'url(#edge-gradient)')
          .style('filter', 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.3))')

        tooltip.style('opacity', '0')
      })

    node
      .append('circle')
      .attr('r', d => (d.group === 'post' ? 10 : 5))
      .attr('fill', d => (d.group === 'post' ? '#3b82f6' : '#1e3a5f'))
      .attr('stroke', d => (d.group === 'post' ? '#60a5fa' : '#3b82f6'))
      .attr('stroke-width', d => (d.group === 'post' ? 2 : 1))
      .attr('stroke-opacity', d => (d.group === 'post' ? 0.4 : 0.3))
      .attr('class', 'transition-all duration-300 cursor-pointer')
      .style('filter', d => (d.group === 'post' ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none'))

    node
      .append('text')
      .text(d => d.label)
      .attr('dx', 14)
      .attr('dy', 4)
      .attr('fill', '#52525b')
      .attr('font-size', '9px')
      .attr('font-family', 'Space Grotesk')
      .attr('class', 'pointer-events-none select-none uppercase tracking-widest')

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x || 0)
        .attr('y1', d => (d.source as GraphNode).y || 0)
        .attr('x2', d => (d.target as GraphNode).x || 0)
        .attr('y2', d => (d.target as GraphNode).y || 0)

      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return () => {
      simulation.stop()
    }
  }, [nodes, links, viewMode, selectedCategory, categories, gravity, linkDist, isD3Loaded, posts])

  useEffect(() => {
    if (simulationRef.current && d3Ref.current) {
      const d3 = d3Ref.current
      simulationRef.current.force('charge', d3.forceManyBody().strength(gravity))
      const linkForce = simulationRef.current.force('link') as d3Types.ForceLink<GraphNode, GraphLink> | undefined
      if (linkForce) {
        linkForce.distance(linkDist)
      }
      simulationRef.current.alpha(0.3).restart()
    }
  }, [gravity, linkDist])

  // Show loading skeleton while d3 loads
  if (!isD3Loaded) {
    return (
      <div className="w-full h-full relative overflow-hidden bg-background bg-grid flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Loading Graph...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-background bg-grid">
      {/* Category Filter */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-3 p-2 glass rounded-2xl shadow-2xl">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border ${
              !selectedCategory
                ? 'bg-white text-background border-white'
                : 'bg-transparent text-zinc-500 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border ${
                selectedCategory === cat
                  ? 'bg-primary text-white border-primary shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                  : 'bg-transparent text-zinc-500 border-white/10 hover:border-primary/40 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed pointer-events-none opacity-0 transition-opacity duration-200 glass px-3 py-2 rounded-xl border border-white/10 text-[9px] font-mono text-zinc-400 z-[100] whitespace-nowrap shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[120px]"
      />

      {/* Controls Sidebar */}
      <div className="absolute top-8 right-8 flex flex-col gap-4 pointer-events-none w-64">
        <div className="glass p-5 rounded-2xl pointer-events-auto shadow-2xl border-white/10">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary animate-pulse">
                analytics
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">
                Graph Stats
              </span>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-end">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">
                Connectivity
              </span>
              <span className="text-sm font-bold text-primary font-mono">
                {((links.length / nodes.length) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${(links.length / nodes.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center bg-zinc-900/50 rounded-full p-1 border border-white/5">
              <button
                onClick={() => setViewMode('physical')}
                className={`flex-1 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${
                  viewMode === 'physical'
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Physical
              </button>
              <button
                onClick={() => setViewMode('semantic')}
                className={`flex-1 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${
                  viewMode === 'semantic'
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Semantic
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] text-zinc-500 uppercase tracking-tighter font-mono">
                <span>Link Distance</span>
                <span>{linkDist}px</span>
              </div>
              <input
                type="range"
                min="50"
                max="400"
                step="10"
                value={linkDist}
                onChange={e => setLinkDist(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] text-zinc-500 uppercase tracking-tighter font-mono">
                <span>Charge Density</span>
                <span>{Math.abs(gravity)}</span>
              </div>
              <input
                type="range"
                min="-1200"
                max="-100"
                step="20"
                value={gravity}
                onChange={e => setGravity(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
              Knowledge Density
            </span>
            <div className="flex flex-wrap gap-1">
              {categories.map(cat => (
                <span
                  key={cat}
                  className={`px-2 py-0.5 rounded-sm bg-zinc-900 border text-[8px] font-mono transition-all ${
                    selectedCategory === cat
                      ? 'border-primary text-primary'
                      : 'border-white/5 text-zinc-400'
                  }`}
                >
                  {cat.toUpperCase()}: {posts.filter(p => p.category === cat).length}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Post Preview Drawer */}
      <PostPreviewDrawer
        post={selectedPost}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setTimeout(() => setSelectedPost(null), 300)
        }}
      />
    </div>
  )
}
