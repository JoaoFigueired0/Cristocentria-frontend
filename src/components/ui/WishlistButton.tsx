'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useWishlistStore } from '@/store/wishlist'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  productId: string
  className?: string
  size?: 'sm' | 'md'
}

export function WishlistButton({ productId, className, size = 'md' }: WishlistButtonProps) {
  const { data: session } = useSession()
  const toggle = useWishlistStore((s) => s.toggle)
  const isActive = useWishlistStore((s) => s.has(productId))
  const [loading, setLoading] = useState(false)

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const wasActive = isActive
    toggle(productId)

    if (!session) return

    setLoading(true)
    try {
      if (wasActive) {
        await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' })
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
      }
    } catch {
      toggle(productId) // reverte se falhar
    } finally {
      setLoading(false)
    }
  }

  const btnSize = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={isActive ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      className={cn(
        'flex items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:bg-white disabled:opacity-50',
        btnSize,
        className
      )}
    >
      <svg
        className={cn(
          'transition-colors',
          iconSize,
          isActive ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-brand-graphite'
        )}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  )
}
