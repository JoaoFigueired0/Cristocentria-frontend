'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { formatBRL } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface StickyAddToCartProps {
  name: string
  price: number
  anchorRef: React.RefObject<HTMLDivElement>
  onAdd: () => void
  loading?: boolean
  disabled?: boolean
}

export function StickyAddToCart({
  name,
  price,
  anchorRef,
  onAdd,
  loading,
  disabled,
}: StickyAddToCartProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Mostra o sticky quando o elemento âncora (preço) sai da tela
        setVisible(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '-60px 0px 0px 0px' }
    )

    observer.observe(anchor)
    return () => observer.disconnect()
  }, [anchorRef])

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-30 border-t border-brand-border bg-white px-4 py-3 transition-transform duration-300 md:hidden',
        visible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-brand-black">{name}</p>
          <p className="text-sm font-semibold text-brand-black">{formatBRL(price)}</p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={onAdd}
          loading={loading}
          disabled={disabled}
          className="shrink-0"
        >
          Adicionar
        </Button>
      </div>
    </div>
  )
}
