import { z } from 'zod'

export const FrontmatterSchema = z.object({
  author: z.string(),
  pubDatetime: z.coerce.date(),
  title: z.string(),
  postSlug: z.string().optional(),
  featured: z.boolean().optional(),
  draft: z.boolean().optional(),
  tags: z.array(z.string()),
  description: z.string(),
  canonicalURL: z.string().optional(),
  ogImage: z.string().optional()
})

export type Frontmatter = z.infer<typeof FrontmatterSchema>

export interface Post {
  slug: string
  title: string
  description: string
  date: string
  pubDatetime: Date
  category: string
  tags: string[]
  author: string
  featured: boolean
  draft: boolean
  readTime: string
  excerpt: string
  content: string
  image?: string
  relatedSlugs?: string[]
}
