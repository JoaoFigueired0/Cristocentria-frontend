import { cn } from '@/lib/utils'

const variants = {
  // Genéricos
  dark:       'bg-brand-black text-white',
  light:      'bg-brand-offwhite text-brand-graphite border border-brand-border',
  olive:      'bg-brand-olive text-white',
  navy:       'bg-brand-navy text-white',
  pix:        'bg-green-100 text-green-700 border border-green-200',
  // Status de pedido (semânticos)
  pending:    'bg-amber-50 text-amber-700 border border-amber-200',
  waiting:    'bg-orange-50 text-orange-700 border border-orange-200',
  paid:       'bg-blue-50 text-blue-700 border border-blue-200',
  processing: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  shipped:    'bg-violet-50 text-violet-700 border border-violet-200',
  delivered:  'bg-green-50 text-green-700 border border-green-200',
  cancelled:  'bg-red-50 text-red-600 border border-red-200',
  refunded:   'bg-gray-100 text-gray-600 border border-gray-200',
} as const

export type BadgeVariant = keyof typeof variants

interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children: React.ReactNode
}

export function Badge({ variant = 'dark', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium tracking-wide uppercase',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
