'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSearch } from '@/components/providers/SearchProvider'
import { SearchPalette } from '@/components/ui/SearchPalette'

export function Header() {
  const pathname = usePathname()
  const { posts, isSearchOpen, setIsSearchOpen } = useSearch()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // client-event-listeners: Consolidated key handler
  // Note: Search Escape is handled in SearchProvider, this only handles mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobileMenuOpen])

  const navItems = [
    { href: '/', label: 'Journal' },
    { href: '/atlas', label: 'Atlas' },
    { href: '/about', label: 'About' },
  ]

  return (
    <>
      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 z-[100] glass flex flex-col items-center justify-center gap-8 transition-all duration-500 ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-6 right-6 size-12 rounded-full border border-white/10 flex items-center justify-center text-white"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <nav className="flex flex-col items-center gap-8">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-2xl font-display font-bold uppercase tracking-[0.2em] transition-colors ${
                pathname === item.href ? 'text-primary' : 'text-zinc-500'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-[70] px-4 md:px-6 py-4 glass border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden size-10 flex items-center justify-center text-white"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <Link
            href="/"
            className="text-lg font-bold text-white hover:text-primary transition-colors"
          >
            ziho
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[11px] font-mono uppercase tracking-widest transition-colors ${
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4 md:border-l border-white/10 md:pl-6">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
            <span className="hidden md:inline text-[9px] font-mono border border-white/10 px-1.5 py-0.5 rounded text-zinc-600 group-hover:text-zinc-400">
              ⌘K
            </span>
          </button>
        </div>
      </header>

      {/* Search Palette */}
      <SearchPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        posts={posts}
      />
    </>
  )
}
