'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface MeasureGuideModalProps {
  open: boolean
  onClose: () => void
}

const TABLE = [
  { size: 'PP', chest: '86–90', waist: '70–74', hip: '92–96', height: '155–160' },
  { size: 'P',  chest: '90–94', waist: '74–78', hip: '96–100', height: '160–165' },
  { size: 'M',  chest: '94–98', waist: '78–82', hip: '100–104', height: '165–170' },
  { size: 'G',  chest: '98–102', waist: '82–86', hip: '104–108', height: '170–175' },
  { size: 'GG', chest: '102–108', waist: '86–92', hip: '108–114', height: '175–180' },
  { size: 'XGG', chest: '108–116', waist: '92–100', hip: '114–122', height: '180–185' },
]

export function MeasureGuideModal({ open, onClose }: MeasureGuideModalProps) {
  useEffect(() => {
    if (!open) return
    const close = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', close)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', close)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Guia de medidas"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-xl rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl text-brand-black">GUIA DE MEDIDAS</h2>
          <button
            onClick={onClose}
            aria-label="Fechar guia"
            className="rounded p-1 text-brand-muted hover:text-brand-black"
          >
            <svg className="h-5 w-5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
            </svg>
          </button>
        </div>

        <p className="mb-4 text-xs text-brand-muted">Todas as medidas em centímetros (cm)</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border">
                {['Tamanho', 'Busto', 'Cintura', 'Quadril', 'Altura'].map((h) => (
                  <th key={h} className="pb-2 pr-4 text-left font-semibold text-brand-black">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {TABLE.map((row) => (
                <tr key={row.size} className="hover:bg-brand-surface2">
                  <td className="py-2.5 pr-4 font-medium">{row.size}</td>
                  <td className="py-2.5 pr-4 text-brand-graphite">{row.chest}</td>
                  <td className="py-2.5 pr-4 text-brand-graphite">{row.waist}</td>
                  <td className="py-2.5 pr-4 text-brand-graphite">{row.hip}</td>
                  <td className="py-2.5 pr-4 text-brand-graphite">{row.height}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-brand-muted">
          Em caso de dúvida entre dois tamanhos, recomendamos o maior.
        </p>
      </div>
    </div>
  )
}
