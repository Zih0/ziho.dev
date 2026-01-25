'use client'

import Link from 'next/link'
import type { Post } from '@/types/post'
import { Drawer } from '@/components/ui/Drawer'

interface PostPreviewDrawerProps {
  post: Post | null
  isOpen: boolean
  onClose: () => void
}

function truncateContent(content: string, maxLength: number = 250): string {
  // Remove markdown frontmatter if present
  const cleanContent = content.replace(/^---[\s\S]*?---\s*/, '').trim()

  if (cleanContent.length <= maxLength) return cleanContent

  const truncated = cleanContent.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  return lastSpace > 0
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...'
}

export function PostPreviewDrawer({ post, isOpen, onClose }: PostPreviewDrawerProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} position="left">
      {post && (
        <div className="flex-1 overflow-y-auto p-6 pt-8">
          {/* Header Badge */}
          <div className="flex items-center gap-2 mb-6">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Post Preview
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white leading-tight mb-4">
            {post.title}
          </h2>

          {/* Meta */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 mb-4">
            <time dateTime={post.pubDatetime.toISOString()}>{post.date}</time>
            <span className="text-zinc-700">·</span>
            <span>{post.readTime}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 rounded-md bg-zinc-900 border border-white/5 text-[10px] font-mono text-zinc-400 uppercase tracking-wider"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Divider */}
          <hr className="border-white/5 mb-6" />

          {/* Description */}
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            {post.description}
          </p>

          {/* Content Preview */}
          <div className="text-sm text-zinc-300 leading-relaxed mb-8 p-4 rounded-xl bg-zinc-900/50 border border-white/5">
            {truncateContent(post.content)}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href={`/blog/${post.slug}`}
              className="group relative w-full px-5 py-3.5 rounded-xl bg-gradient-to-r from-primary to-blue-400 text-white text-[11px] font-bold uppercase tracking-[0.15em] text-center overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-[1.02]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Read Full Post
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <button
              onClick={onClose}
              className="group w-full px-5 py-3.5 rounded-xl bg-zinc-900/80 border border-white/10 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-400 text-center transition-all duration-300 hover:border-white/20 hover:text-zinc-200 hover:bg-zinc-800/80"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">arrow_back</span>
                Back to Graph
              </span>
            </button>
          </div>
        </div>
      )}
    </Drawer>
  )
}
