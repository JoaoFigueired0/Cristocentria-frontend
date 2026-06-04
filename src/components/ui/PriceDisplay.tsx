import { formatBRL, pixDiscountPct } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PriceDisplayProps {
  basePrice: number
  pixPrice: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { base: 'text-sm',  pix: 'text-base', label: 'text-xs' },
  md: { base: 'text-lg',  pix: 'text-2xl',  label: 'text-xs' },
  lg: { base: 'text-xl',  pix: 'text-3xl',  label: 'text-sm' },
}

export function PriceDisplay({
  basePrice,
  pixPrice,
  size = 'md',
  className,
}: PriceDisplayProps) {
  const s = sizes[size]
  const discount = pixDiscountPct(basePrice, pixPrice)

  return (
    <div className={cn('flex flex-wrap items-end gap-x-3 gap-y-0.5', className)}>
      {/* PIX price — destaque */}
      <div className="flex items-end gap-1.5">
        <span className={cn('font-display text-brand-pix', s.pix)}>
          {formatBRL(pixPrice)}
        </span>
        <span className={cn('mb-0.5 text-brand-pix font-medium', s.label)}>
          no PIX
        </span>
        {discount > 0 && (
          <span className="mb-0.5 rounded-sm bg-brand-pix/10 px-1 py-0.5 text-xs font-semibold text-green-700">
            -{discount}%
          </span>
        )}
      </div>

      {/* Preço base riscado */}
      <span className={cn('text-brand-muted line-through', s.base)}>
        {formatBRL(basePrice)}
      </span>
    </div>
  )
}
