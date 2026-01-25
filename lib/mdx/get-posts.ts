import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { format } from 'date-fns'
import readingTime from 'reading-time'
import { cache } from 'react'
import { FrontmatterSchema, type Post } from '@/types/post'

const CONTENT_DIR = path.join(process.cwd(), 'content/blog')

// server-cache-react: Use React.cache() for per-request deduplication
export const getPosts = cache(async function getPosts(): Promise<Post[]> {
  const files = fs.readdirSync(CONTENT_DIR)

  const posts = files
    .filter(file => file.endsWith('.mdx') || file.endsWith('.md'))
    .map(file => {
      const slug = file.replace(/\.(mdx|md)$/, '')
      const filePath = path.join(CONTENT_DIR, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(fileContent)

      try {
        const validated = FrontmatterSchema.parse(data)

        return {
          slug: validated.postSlug || slug,
          title: validated.title,
          description: validated.description,
          date: format(new Date(validated.pubDatetime), 'MMM dd, yyyy'),
          pubDatetime: validated.pubDatetime,
          category: validated.tags[0] || 'Uncategorized',
          tags: validated.tags,
          author: validated.author,
          featured: validated.featured || false,
          draft: validated.draft || false,
          readTime: readingTime(content).text,
          excerpt: validated.description,
          content: content
        } as Post
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          throw new Error(`Invalid frontmatter in ${file}: ${error}`)
        }
        console.error(`ERROR: Skipping ${file} due to invalid frontmatter:`, error)
        return null
      }
    })
    .filter((post): post is Post => post !== null && !post.draft)
    .sort((a, b) => new Date(b.pubDatetime).getTime() - new Date(a.pubDatetime).getTime())

  return posts
})

// server-cache-react: Use React.cache() for per-request deduplication
export const getPostBySlug = cache(async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPosts()
  return posts.find(post => post.slug === slug) || null
})
