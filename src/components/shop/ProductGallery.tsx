'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: string[]
  alt: string
}

function isExternalUrl(url: string) {
  return url.startsWith('http://') || url.startsWith('https://')
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [active, setActive] = useState(0)

  if (!images.length) return null

  const activeSrc = images[active] ?? '/logo/icon-app.svg'

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-row gap-2 overflow-x-auto md:flex-col md:overflow-x-visible">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Ver imagem ${i + 1}`}
              aria-pressed={active === i}
              className={cn(
                'relative h-16 w-16 shrink-0 overflow-hidden rounded border transition-all',
                active === i
                  ? 'border-brand-black'
                  : 'border-brand-border hover:border-brand-graphite'
              )}
            >
              <Image
                src={src}
                alt={`${alt} — foto ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized={isExternalUrl(src)}
              />
            </button>
          ))}
        </div>
      )}

      {/* Imagem principal */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-brand-surface2">
        <Image
          src={activeSrc}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-opacity duration-300 animate-fade-in"
          priority
          unoptimized={isExternalUrl(activeSrc)}
        />
      </div>
    </div>
  )
}
