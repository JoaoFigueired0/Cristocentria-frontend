'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const COLOR_CLASSES: Record<string, string> = {
  BLACK:   'bg-[#0A0A0A]',
  WHITE:   'bg-[#F8F6F1]',
  GRAPHITE:'bg-[#3A3A3A]',
  OFFWHITE:'bg-[#EDE9E0]',
  BEIGE:   'bg-[#C9B99A]',
  OLIVE:   'bg-[#5C6645]',
  NAVY:    'bg-[#1C2B4A]',
  COFFEE:  'bg-[#6B4226]',
}

const COLOR_LABELS: Record<string, string> = {
  BLACK: 'Preto', WHITE: 'Branco', GRAPHITE: 'Grafite',
  OFFWHITE: 'Off-white', BEIGE: 'Areia', OLIVE: 'Oliva',
  NAVY: 'Marinho', COFFEE: 'Café',
}

interface ColorSelectorProps {
  colors: string[]
  selected?: string | null
  onChange: (color: string) => void
  className?: string
}

export function ColorSelector({
  colors,
  selected,
  onChange,
  className,
}: ColorSelectorProps) {
  const [tooltip, setTooltip] = useState<string | null>(null)

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span className="text-sm font-medium text-brand-graphite">
        Cor
        {selected && (
          <span className="ml-2 font-semibold text-brand-black">
            {COLOR_LABELS[selected] ?? selected}
          </span>
        )}
      </span>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Selecione a cor">
        {colors.map((color) => {
          const isSelected = selected === color
          const label = COLOR_LABELS[color] ?? color
          const isLight = ['WHITE', 'OFFWHITE', 'BEIGE'].includes(color)

          return (
            <div key={color} className="relative">
              {/* Tooltip */}
              {tooltip === color && (
                <div className="absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-brand-black px-2 py-1 text-xs text-white">
                  {label}
                  <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-brand-black" />
                </div>
              )}

              <button
                type="button"
                onClick={() => onChange(color)}
                onMouseEnter={() => setTooltip(color)}
                onMouseLeave={() => setTooltip(null)}
                aria-pressed={isSelected}
                aria-label={label}
                className={cn(
                  'h-8 w-8 rounded-full transition-all duration-150',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy',
                  COLOR_CLASSES[color] ?? 'bg-brand-muted',
                  isLight && 'border border-brand-border',
                  isSelected
                    ? 'ring-2 ring-brand-black ring-offset-2'
                    : 'hover:scale-110'
                )}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
