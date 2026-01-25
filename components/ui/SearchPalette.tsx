'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'

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

  const handleSelect = useCallback((slug: string) => {
    router.push(`/blog/${slug}`)
    onClose()
    setSearchQuery('')
  }, [router, onClose])

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
          setSearchQuery('')
        }
      }}
      label="Search posts"
      loop
      className="fixed inset-0 z-[100]"
    >
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-start justify-center pt-20 px-4">
        <div className="relative w-full max-w-2xl glass rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border-primary/20">
          <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
            <span className="material-symbols-outlined text-zinc-400">search</span>
            <Command.Input
              autoFocus
              placeholder="Search thoughts, tags, or concepts..."
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-white w-full text-lg placeholder:text-zinc-600 font-display"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <span className="text-[10px] font-mono text-zinc-500 border border-white/10 px-1.5 py-0.5 rounded">
              ESC
            </span>
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-4">
            <Command.Empty className="py-12 text-center text-zinc-500 text-sm">
              No connections found.
            </Command.Empty>
            {posts.map(post => (
              <Command.Item
                key={post.slug}
                value={`${post.title} ${post.tags.join(' ')} ${post.description}`}
                onSelect={() => handleSelect(post.slug)}
                className="group p-4 rounded-xl data-[selected=true]:bg-white/5 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white group-data-[selected=true]:text-primary transition-colors">
                    {post.title}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                    {post.category} • {post.date}
                  </span>
                </div>
                <span className="material-symbols-outlined text-zinc-700 group-data-[selected=true]:text-white transition-colors">
                  arrow_forward
                </span>
              </Command.Item>
            ))}
          </Command.List>
        </div>
      </div>
    </Command.Dialog>
  )
}
