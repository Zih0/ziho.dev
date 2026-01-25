'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface SearchPost {
  slug: string
  title: string
  description: string
  date: string
  category: string
  tags: string[]
}

interface SearchPaletteProps {
  isOpen: boolean
  onClose: () => void
  posts?: SearchPost[]
}

export function SearchPalette({ isOpen, onClose, posts = [] }: SearchPaletteProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  // rerender-derived-state-no-effect: Calculate derived state during rendering
  const filteredPosts = useMemo(() => {
    if (!searchQuery) {
      return posts
    }

    const query = searchQuery.toLowerCase()
    return posts.filter(
      post =>
        post.title.toLowerCase().includes(query) ||
        post.tags.some(t => t.toLowerCase().includes(query)) ||
        post.description.toLowerCase().includes(query)
    )
  }, [searchQuery, posts])

  const handleSelect = (slug: string) => {
    router.push(`/blog/${slug}`)
    onClose()
    setSearchQuery('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl glass rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border-primary/20">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
          <span className="material-symbols-outlined text-zinc-400">search</span>
          <input
            autoFocus
            placeholder="Search thoughts, tags, or concepts..."
            className="bg-transparent border-none focus:ring-0 focus:outline-none text-white w-full text-lg placeholder:text-zinc-600 font-display"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <span className="text-[10px] font-mono text-zinc-500 border border-white/10 px-1.5 py-0.5 rounded">
            ESC
          </span>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-4">
          {filteredPosts.length > 0 ? (
            <div className="space-y-2">
              {filteredPosts.map(post => (
                <div
                  key={post.slug}
                  onClick={() => handleSelect(post.slug)}
                  className="group p-4 rounded-xl hover:bg-white/5 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                      {post.title}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                      {post.category} • {post.date}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-zinc-700 group-hover:text-white transition-colors">
                    arrow_forward
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500 text-sm">
              No connections found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
