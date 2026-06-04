import { cn } from '@/lib/utils'

interface LogoProps {
  size?: number
  inverted?: boolean
  className?: string
}

export function LogoMark({ size = 40, inverted = false, className }: LogoProps) {
  const bg = inverted ? '#F8F6F1' : '#0A0A0A'
  const fg = inverted ? '#0A0A0A' : '#F8F6F1'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Cristocentria logo"
      className={className}
    >
      {/* Círculo fundo */}
      <circle cx="32" cy="32" r="31" fill={bg} stroke={fg} strokeWidth="1" />

      {/* Globo — círculo externo */}
      <circle cx="32" cy="32" r="18" stroke={fg} strokeWidth="1" fill="none" />

      {/* Globo — elipse horizontal achatada 1 */}
      <ellipse cx="32" cy="32" rx="18" ry="5.5" stroke={fg} strokeWidth="1" fill="none" />

      {/* Globo — elipse horizontal achatada 2 */}
      <ellipse cx="32" cy="32" rx="18" ry="11" stroke={fg} strokeWidth="1" fill="none" />

      {/* Cruz cristã
          Vertical: de topo a base do globo (y=14 → y=50)
          Horizontal: no terço superior (14 + (50-14)/3 ≈ 26) */}
      <line x1="32" y1="14" x2="32" y2="50" stroke={fg} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="21" y1="26" x2="43" y2="26" stroke={fg} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function LogoFull({
  size = 40,
  inverted = false,
  className,
}: LogoProps) {
  const textColor = inverted ? 'text-brand-black' : 'text-brand-white'

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <LogoMark size={size} inverted={inverted} />
      <span
        className={cn(
          'font-display text-2xl tracking-widest',
          textColor
        )}
      >
        CRISTOCENTRIA
      </span>
    </div>
  )
}
