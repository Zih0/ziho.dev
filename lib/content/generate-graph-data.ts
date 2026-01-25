import type { Post } from '@/types/post'
import type { GraphNode, GraphLink } from '@/types/graph'

export function generateGraphData(posts: Post[]): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []
  const tagsSet = new Set<string>()

  posts.forEach(post => {
    nodes.push({
      id: post.slug,
      label: post.title,
      group: 'post',
      category: post.category
    })

    post.tags.forEach(tag => {
      tagsSet.add(tag)
      links.push({ source: post.slug, target: tag })
    })

    if (post.relatedSlugs) {
      post.relatedSlugs.forEach(relatedSlug => {
        const relatedExists = posts.some(p => p.slug === relatedSlug)
        if (relatedExists) {
          links.push({ source: post.slug, target: relatedSlug })
        }
      })
    }
  })

  tagsSet.forEach(tag => {
    nodes.push({ id: tag, label: `#${tag}`, group: 'tag' })
  })

  return { nodes, links }
}
