'use client'

import { useRouter } from 'next/navigation'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Novidades' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'featured', label: 'Destaque' },
]

interface SortSelectProps {
  currentSort: string
  currentParams: {
    color?: string
    size?: string
    category?: string
  }
}

export function SortSelect({ currentSort, currentParams }: SortSelectProps) {
  const router = useRouter()

  function handleChange(value: string) {
    const sp = new URLSearchParams()
    if (currentParams.color) sp.set('color', currentParams.color)
    if (currentParams.size) sp.set('size', currentParams.size)
    if (currentParams.category) sp.set('category', currentParams.category)
    if (value !== 'newest') sp.set('sort', value)
    const str = sp.toString()
    router.push(`/colecao${str ? `?${str}` : ''}`)
  }

  return (
    <div className="mb-6 flex items-center justify-end gap-2">
      <label htmlFor="sort" className="text-sm text-brand-muted">Ordenar:</label>
      <select
        id="sort"
        value={currentSort}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded border border-brand-border bg-white px-3 py-1.5 text-sm text-brand-black"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
