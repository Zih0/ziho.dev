import type { Metadata } from 'next'
import { getPosts } from '@/lib/mdx/get-posts'
import { generateGraphData } from '@/lib/content/generate-graph-data'
import { GraphView } from '@/components/graph/GraphView'

export const metadata: Metadata = {
  title: 'Atlas',
  description: 'Knowledge graph visualization',
}

export default async function AtlasPage() {
  const posts = await getPosts()
  const graphData = generateGraphData(posts)

  return (
    <div className="w-full h-[calc(100vh-73px)]">
      <GraphView
        posts={posts}
        initialNodes={graphData.nodes}
        initialLinks={graphData.links}
      />
    </div>
  )
}
