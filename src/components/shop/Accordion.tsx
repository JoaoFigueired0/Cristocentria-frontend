'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface AccordionItem {
  title: string
  content: React.ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  className?: string
}

export function Accordion({ items, className }: AccordionProps) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className={cn('divide-y divide-brand-border', className)}>
      {items.map((item, i) => (
        <div key={i}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-brand-black"
          >
            {item.title}
            <svg
              className={cn(
                'h-4 w-4 shrink-0 text-brand-muted transition-transform duration-200',
                open === i && 'rotate-180'
              )}
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 10.243L2.757 5 2 5.757 8 11.757l6-6L13.243 5 8 10.243z" />
            </svg>
          </button>

          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              open === i ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <div className="pb-4 text-sm leading-relaxed text-brand-graphite">
              {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
