'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import type { Post } from '@/types/post'

interface HomeContentProps {
  posts: Post[]
  categories: string[]
}

export function HomeContent({ posts, categories }: HomeContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredPosts = useMemo(
    () => selectedCategory ? posts.filter(p => p.category === selectedCategory) : posts,
    [posts, selectedCategory]
  )

  const handleClearCategory = useCallback(() => setSelectedCategory(null), [])
  const handleSelectCategory = useCallback((cat: string) => setSelectedCategory(cat), [])

  return (
    <div className="animate-fadeIn max-w-2xl mx-auto px-5 md:px-6 py-12 md:py-20">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={handleClearCategory}
          className={`text-sm transition-colors ${
            !selectedCategory
              ? 'text-zinc-200'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          전체
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleSelectCategory(cat)}
            className={`text-sm transition-colors ${
              selectedCategory === cat
                ? 'text-zinc-200'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Post list */}
      {filteredPosts.length > 0 ? (
        <ul className="space-y-6">
          {filteredPosts.map(post => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-zinc-300 group-hover:text-zinc-100 transition-colors">
                    {post.title}
                  </h2>
                  <span className="text-[13px] text-zinc-600 shrink-0">
                    {post.date}
                  </span>
                </div>
                {post.description && (
                  <p className="mt-1 text-sm text-zinc-500 line-clamp-1">
                    {post.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-12 text-center">
          <p className="text-zinc-500">글이 없습니다.</p>
        </div>
      )}
    </div>
  )
}
