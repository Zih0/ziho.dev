'use client'

import { useEffect, useRef, useState } from 'react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  position?: 'left' | 'right'
  width?: string
  children: React.ReactNode
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

export function Drawer({
  isOpen,
  onClose,
  position = 'left',
  width = 'w-96',
  children,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
}: DrawerProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Handle open/close animation states
  useEffect(() => {
    let animationTimer: ReturnType<typeof setTimeout>
    let unmountTimer: ReturnType<typeof setTimeout>

    if (isOpen) {
      setShouldRender(true)
      // Small delay to ensure DOM is ready before animation
      animationTimer = setTimeout(() => {
        setIsAnimating(true)
      }, 10)
    } else {
      setIsAnimating(false)
      // Wait for exit animation to complete before unmounting
      unmountTimer = setTimeout(() => {
        setShouldRender(false)
      }, 300)
    }

    return () => {
      clearTimeout(animationTimer)
      clearTimeout(unmountTimer)
    }
  }, [isOpen])

  // ESC key handler
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose, closeOnEscape])

  // Focus management
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const previousFocus = document.activeElement as HTMLElement
      drawerRef.current.focus()

      return () => {
        previousFocus?.focus()
      }
    }
  }, [isOpen])

  if (!shouldRender) return null

  const isLeft = position === 'left'
  const animationClass = isAnimating
    ? 'animate-slideInLeft'
    : 'animate-slideOutLeft'

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[75] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-label="Close drawer"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={`fixed top-0 ${isLeft ? 'left-0' : 'right-0'} h-full ${width} z-[80] glass border-r border-white/10 flex flex-col outline-none ${animationClass} ${className}`}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="group absolute top-6 right-6 size-9 flex items-center justify-center rounded-xl border border-white/10 bg-zinc-900/50 hover:border-primary/40 hover:bg-zinc-800/80 transition-all duration-300 z-10"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-base text-zinc-400 group-hover:text-primary transition-colors">
              close
            </span>
          </button>
        )}

        {children}
      </div>
    </>
  )
}
