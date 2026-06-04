import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  href?: string
  linkLabel?: string
  className?: string
}

export function SectionHeader({
  title,
  href,
  linkLabel = 'Ver todos →',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between', className)}>
      <h2 className="font-display text-4xl tracking-wide text-brand-black">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-sm font-medium text-brand-graphite underline-offset-2 hover:underline"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  )
}
