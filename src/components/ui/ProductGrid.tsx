import { cn } from '@/lib/utils'

interface ProductGridProps {
  children: React.ReactNode
  className?: string
}

export function ProductGrid({ children, className }: ProductGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      {children}
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="skeleton aspect-[3/4] w-full rounded-lg" />
          <div className="skeleton h-5 w-3/4 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
        </div>
      ))}
    </div>
  )
}
