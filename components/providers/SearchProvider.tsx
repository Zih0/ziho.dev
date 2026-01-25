'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SearchPost {
  slug: string
  title: string
  description: string
  date: string
  category: string
  tags: string[]
}

interface SearchContextType {
  posts: SearchPost[]
  isSearchOpen: boolean
  setIsSearchOpen: (open: boolean) => void
}

const SearchContext = createContext<SearchContextType>({
  posts: [],
  isSearchOpen: false,
  setIsSearchOpen: () => {},
})

export function useSearch() {
  return useContext(SearchContext)
}

interface SearchProviderProps {
  children: ReactNode
  initialPosts: SearchPost[]
}

export function SearchProvider({ children, initialPosts }: SearchProviderProps) {
  const [posts] = useState<SearchPost[]>(initialPosts)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <SearchContext.Provider value={{ posts, isSearchOpen, setIsSearchOpen }}>
      {children}
    </SearchContext.Provider>
  )
}
