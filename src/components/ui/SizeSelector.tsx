'use client'

import { cn } from '@/lib/utils'

const SIZE_ORDER = ['PP', 'P', 'M', 'G', 'GG', 'XGG']

interface SizeSelectorProps {
  sizes: string[]
  unavailableSizes?: string[]
  selected?: string | null
  onChange: (size: string) => void
  className?: string
}

export function SizeSelector({
  sizes,
  unavailableSizes = [],
  selected,
  onChange,
  className,
}: SizeSelectorProps) {
  const orderedSizes = SIZE_ORDER.filter((s) => sizes.includes(s))

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center">
        <span className="text-sm font-medium text-brand-graphite">
          Tamanho
          {selected && (
            <span className="ml-2 font-semibold text-brand-black">{selected}</span>
          )}
        </span>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Selecione o tamanho">
        {orderedSizes.map((size) => {
          const isUnavailable = unavailableSizes.includes(size)
          const isSelected = selected === size

          return (
            <button
              key={size}
              type="button"
              onClick={() => !isUnavailable && onChange(size)}
              aria-pressed={isSelected}
              aria-label={`Tamanho ${size}${isUnavailable ? ' — esgotado' : ''}`}
              disabled={isUnavailable}
              className={cn(
                'relative h-10 min-w-[44px] rounded border px-3 text-sm font-medium transition-all duration-150',
                'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-navy',
                isSelected
                  ? 'border-brand-black bg-brand-black text-brand-white'
                  : 'border-brand-border bg-white text-brand-graphite hover:border-brand-graphite',
                isUnavailable &&
                  'cursor-not-allowed border-brand-border bg-transparent text-brand-muted line-through opacity-50 hover:border-brand-border'
              )}
            >
              {size}
            </button>
          )
        })}
      </div>
    </div>
  )
}
