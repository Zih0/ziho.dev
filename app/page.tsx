import { getPosts } from '@/lib/mdx/get-posts'
import { HomeContent } from '@/components/home/HomeContent'

export const metadata = {
  title: 'Journal',
}

export default async function HomePage() {
  const posts = await getPosts()
  const categories = Array.from(new Set(posts.map(p => p.category)))

  return <HomeContent posts={posts} categories={categories} />
}
