import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPosts, getPostBySlug } from '@/lib/mdx/get-posts'
import { MDXContent } from '@/components/mdx/MDXContent'
import { TableOfContents } from '@/components/mdx/TableOfContents'
import { siteConfig } from '@/config/site'

export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map(post => ({ slug: post.slug }))
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {}
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.pubDatetime.toISOString(),
      authors: [post.author],
      url: `${siteConfig.url}/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="animate-fadeIn">
      {/* Reading-focused background - removes grid noise */}
      <div className="fixed inset-0 bg-gradient-to-b from-background via-zinc-950 to-background pointer-events-none" />

      {/* Notion-like TOC */}
      <TableOfContents content={post.content} />

      <article className="relative max-w-2xl mx-auto px-5 md:px-6 py-12 md:py-20">
        <header className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 mb-5">
            <time dateTime={post.pubDatetime.toISOString()}>{post.date}</time>
            <span className="text-zinc-700">·</span>
            <span>{post.readTime}</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-white leading-snug tracking-tight mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 pt-6 border-t border-zinc-800/60">
            <div className="size-8 rounded-full bg-zinc-800 flex items-center justify-center">
              <span className="text-zinc-400 text-xs font-medium">
                {post.author.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-zinc-400">
              {post.author}
            </span>
          </div>
        </header>

        <div className="prose-reading">
          <MDXContent content={post.content} />
        </div>

        <footer className="mt-16 pt-8 border-t border-zinc-800/60">
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map(t => (
              <span
                key={t}
                className="px-3 py-1.5 rounded-md bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                {t}
              </span>
            ))}
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            목록으로
          </Link>
        </footer>
      </article>
    </div>
  )
}
