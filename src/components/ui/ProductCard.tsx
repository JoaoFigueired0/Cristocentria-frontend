'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Badge } from './Badge'
import { PriceDisplay } from './PriceDisplay'
import { WishlistButton } from './WishlistButton'
import { cn } from '@/lib/utils'

const COLOR_CLASSES: Record<string, string> = {
  BLACK:    'bg-[#0A0A0A]',
  WHITE:    'bg-[#F8F6F1] border border-brand-border',
  GRAPHITE: 'bg-[#3A3A3A]',
  OFFWHITE: 'bg-[#EDE9E0]',
  BEIGE:    'bg-[#C9B99A]',
  OLIVE:    'bg-[#5C6645]',
  NAVY:     'bg-[#1C2B4A]',
  COFFEE:   'bg-[#6B4226]',
}

const COLOR_LABELS: Record<string, string> = {
  BLACK: 'Preto', WHITE: 'Branco', GRAPHITE: 'Grafite',
  OFFWHITE: 'Off-white', BEIGE: 'Areia', OLIVE: 'Oliva',
  NAVY: 'Marinho', COFFEE: 'Café',
}

type Variant = { color: string; stock: number }

interface ProductCardProps {
  id: string
  slug: string
  name: string
  shortDescription?: string | null
  basePrice: number
  pixPrice: number
  images: string[]
  badge?: string | null
  isFeatured?: boolean
  variants: Variant[]
  className?: string
}

export function ProductCard({
  id,
  slug,
  name,
  basePrice,
  pixPrice,
  images,
  badge,
  variants,
  className,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false)
  const [imgError, setImgError] = useState(false)
  const raw = images[0] ?? ''
  const mainImage = imgError || !raw ? '/logo/icon-app.svg' : raw
  const hoverImage = images[1] && !imgError ? images[1] : mainImage
  const isExternal = mainImage.startsWith('http')

  const availableColors = [...new Set(
    variants.filter((v) => v.stock > 0).map((v) => v.color)
  )]

  return (
    <div className={cn('group flex flex-col', className)}>
      {/* Imagem */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-brand-surface2"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Link href={`/produto/${slug}`} aria-label={`Ver produto: ${name}`} className="absolute inset-0">
          <Image
            src={hovered ? hoverImage : mainImage}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-opacity duration-300"
            priority={false}
            unoptimized={isExternal}
            onError={() => setImgError(true)}
          />
          {badge && (
            <div className="absolute left-2 top-2 max-w-[calc(100%-48px)]">
              <Badge variant="dark" className="truncate">{badge}</Badge>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
        </Link>

        {/* Botão favorito — fora do Link para evitar evento aninhado */}
        <WishlistButton
          productId={id}
          size="sm"
          className="absolute right-2 top-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        />
      </div>

      {/* Informações */}
      <Link href={`/produto/${slug}`} className="mt-3 flex flex-col gap-1.5 px-0.5">
        <h3 className="line-clamp-2 font-display text-lg leading-tight tracking-wide text-brand-black">
          {name}
        </h3>

        {availableColors.length > 0 && (
          <div className="flex items-center gap-1" aria-label="Cores disponíveis">
            {availableColors.slice(0, 6).map((color) => (
              <span
                key={color}
                title={COLOR_LABELS[color] ?? color}
                aria-label={COLOR_LABELS[color] ?? color}
                className={cn(
                  'h-3.5 w-3.5 shrink-0 rounded-full',
                  COLOR_CLASSES[color] ?? 'bg-brand-muted'
                )}
              />
            ))}
            {availableColors.length > 6 && (
              <span className="text-xs text-brand-muted">+{availableColors.length - 6}</span>
            )}
          </div>
        )}

        <PriceDisplay basePrice={basePrice} pixPrice={pixPrice} size="sm" />
      </Link>
    </div>
  )
}
